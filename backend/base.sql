-- ====== 0. Extension pour gen_random_uuid() ======
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ====== 1. Types ENUM ======
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
    CREATE TYPE role_enum AS ENUM ('producteur','acheteur','admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
    CREATE TYPE activity_type AS ENUM ('semis','recolte','arrosage','pulverisation','entretien','autre');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('draft','placed','confirmed','shipped','delivered','cancelled');
  END IF;
END$$;

-- ====== 2. Trigger helper for updated_at ======
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ====== 3. app_user (auth minimal) ======
CREATE TABLE app_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role role_enum NOT NULL DEFAULT 'producteur',
  display_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_user_email ON app_user(email);

CREATE TRIGGER trg_app_user_updated_at
BEFORE UPDATE ON app_user
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ====== 4. producer profile ======
CREATE TABLE producer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES app_user(id) ON DELETE CASCADE,
  organisation text,
  region text,
  parcelle_nom text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_producer_updated_at
BEFORE UPDATE ON producer FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ====== 5. buyer profile ======
CREATE TABLE buyer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES app_user(id) ON DELETE CASCADE,
  organisation text,
  adresse text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_buyer_updated_at
BEFORE UPDATE ON buyer FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ====== 6. culture ======
CREATE TABLE culture (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid NOT NULL REFERENCES producer(id) ON DELETE CASCADE,
  nom text NOT NULL,
  variete text,
  annee smallint,
  parcelle text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_culture_prod_nom_var_annee UNIQUE (producer_id, nom, variete, annee)
);

CREATE INDEX idx_culture_producer ON culture(producer_id);

CREATE TRIGGER trg_culture_updated_at
BEFORE UPDATE ON culture FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ====== 7. inventory (etat courant du stock par culture) ======
CREATE TABLE inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  culture_id uuid NOT NULL REFERENCES culture(id) ON DELETE CASCADE,
  quantity numeric(12,3) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit text NOT NULL DEFAULT 'kg',
  reserved numeric(12,3) NOT NULL DEFAULT 0 CHECK (reserved >= 0),
  seuil_alerte numeric(12,3) DEFAULT 0 CHECK (seuil_alerte >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_inventory_culture UNIQUE (culture_id)
);

CREATE INDEX idx_inventory_culture ON inventory(culture_id);

CREATE TRIGGER trg_inventory_updated_at
BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- helper integrity: reserved <= quantity
ALTER TABLE inventory
  ADD CONSTRAINT chk_inventory_reserved_leq_quantity CHECK (reserved <= quantity);

-- ====== 8. inventory_movement (trace des mouvements) ======
CREATE TABLE inventory_movement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id uuid NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  delta numeric(12,3) NOT NULL, -- positive = entrée, negative = sortie
  type text NOT NULL, -- 'achat','vente','recolte','consommation','ajustement', etc.
  source text,
  note text,
  created_by uuid REFERENCES app_user(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_invmove_inventory ON inventory_movement(inventory_id);
CREATE INDEX idx_invmove_created_at ON inventory_movement(created_at);

-- ====== 9. activity (activités agricoles) ======
CREATE TABLE activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid NOT NULL REFERENCES producer(id) ON DELETE CASCADE,
  culture_id uuid REFERENCES culture(id) ON DELETE SET NULL,
  activity_type activity_type NOT NULL,
  activity_date date NOT NULL,
  commentaire text,
  created_by uuid REFERENCES app_user(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_producer ON activity(producer_id);
CREATE INDEX idx_activity_date ON activity(activity_date);

-- ====== 10. notification ======
CREATE TABLE notification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid REFERENCES producer(id) ON DELETE CASCADE,
  user_id uuid REFERENCES app_user(id) ON DELETE CASCADE,
  titre text NOT NULL,
  message text NOT NULL,
  scheduled_for timestamptz,
  sent boolean NOT NULL DEFAULT false,
  read boolean NOT NULL DEFAULT false,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_producer ON notification(producer_id);
CREATE INDEX idx_notification_user ON notification(user_id);

CREATE TRIGGER trg_notification_updated_at
BEFORE UPDATE ON notification FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ====== 11. weather (météo minimale) ======
CREATE TABLE weather (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid REFERENCES producer(id) ON DELETE CASCADE,
  date date NOT NULL,
  icon text,
  temperature numeric(5,2),
  label text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_weather_producer_date ON weather(producer_id, date);

-- ====== 12. product (catalogue) ======
CREATE TABLE product (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid NOT NULL REFERENCES producer(id) ON DELETE CASCADE,
  culture_id uuid REFERENCES culture(id) ON DELETE SET NULL,
  titre text NOT NULL,
  description text,
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  quantity_available numeric(12,3) NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  unit text NOT NULL DEFAULT 'kg',
  image_urls text[], -- array of URL strings
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_producer ON product(producer_id);
CREATE INDEX idx_product_active ON product(active);

CREATE TRIGGER trg_product_updated_at
BEFORE UPDATE ON product FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ====== 13. app_order (panier = draft) ======
CREATE TABLE app_order (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES buyer(id) ON DELETE SET NULL,
  producer_id uuid REFERENCES producer(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'draft',
  total_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  currency text NOT NULL DEFAULT 'MGA',
  placed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_order_status ON app_order(status);

CREATE TRIGGER trg_app_order_updated_at
BEFORE UPDATE ON app_order FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ====== 14. order_item ======
CREATE TABLE order_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES app_order(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES product(id),
  quantity numeric(12,3) NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  line_total numeric(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orderitem_order ON order_item(order_id);
CREATE INDEX idx_orderitem_product ON order_item(product_id);

-- ====== 15. order_status_history (léger audit) ======
CREATE TABLE order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES app_order(id) ON DELETE CASCADE,
  prev_status order_status,
  new_status order_status NOT NULL,
  changed_by uuid REFERENCES app_user(id),
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orderstatushist_order ON order_status_history(order_id);

-- ====== 16. Optional helper function: apply_inventory_movement ======
CREATE OR REPLACE FUNCTION apply_inventory_movement(
  p_inventory_id uuid,
  p_delta numeric,
  p_type text,
  p_source text,
  p_note text,
  p_user uuid
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- insert movement
  INSERT INTO inventory_movement(inventory_id, delta, type, source, note, created_by, created_at)
  VALUES (p_inventory_id, p_delta, p_type, p_source, p_note, p_user, now());

  -- update inventory inside same transaction
  UPDATE inventory
  SET quantity = quantity + p_delta,
      updated_at = now()
  WHERE id = p_inventory_id;

  -- prevent negative stock
  IF (SELECT quantity FROM inventory WHERE id = p_inventory_id) < 0 THEN
    RAISE EXCEPTION 'Stock negatif non permis pour inventory %', p_inventory_id;
  END IF;
END;
$$;

CREATE TYPE role_enum AS ENUM ('producteur','acheteur','admin');


-- End of DDL
ALTER TABLE order_item
ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();


INSERT INTO app_user (email, password_hash, role, display_name)
VALUES ('buyer@mail.com','test123','acheteur','Acheteur 1')
RETURNING id;

INSERT INTO buyer (user_id, organisation, adresse)
VALUES ('d492ad09-c45e-44e0-ae56-4416586f28e4','Tesla','Antananarivo')
RETURNING id;


INSERT INTO app_user (email, password_hash, role, display_name)
VALUES ('alice@mail.com', 'azer', 'producteur', 'Alice')
RETURNING id;

INSERT INTO producer (user_id, organisation, region, parcelle_nom)
VALUES ('6fe2b849-a6ea-4480-aaac-90e8a9d0a57f', 'Ferme Alice', 'Antananarivo', 'Parcelle 1')
RETURNING id;


INSERT INTO culture (id, producer_id, nom, variete, annee, parcelle, note)
VALUES
('fb4716ad-b486-4b2c-a5d2-fa09d8721d5c', 'Mange', 'Roma', 2025, 'Parcelle A', 'Mange bio de première qualité'),
('fb4716ad-b486-4b2c-a5d2-fa09d8721d5c', 'Pomme', 'Golden', 2025, 'Parcelle B', 'Pommes sucrées et juteuses'),
('fb4716ad-b486-4b2c-a5d2-fa09d8721d5c', 'Carotte', 'Orange', 2025, 'Parcelle C', 'Carottes fraîches et croquantes'),
('fb4716ad-b486-4b2c-a5d2-fa09d8721d5c', 'Miel', 'Acacia', 2025, 'Ruche 1', 'Miel pur naturel'),
('fb4716ad-b486-4b2c-a5d2-fa09d8721d5c', 'Laitue', 'Romana', 2025, 'Parcelle D', 'Laitue bio fraîche');



INSERT INTO product (producer_id, culture_id, titre, description, price, quantity_available, unit, image_urls, active)
VALUES
('fb4716ad-b486-4b2c-a5d2-fa09d8721d5c', 'f23d5470-6a6d-4c8d-9d1f-5116e98be0e0', 'Mange Bio Roma', 'Mange rouges, cultivées sans pesticide', 2.50, 100.500, 'kg', ARRAY['https://www.vitabio.fr/img/modules/oh_ingredients/ingredients/15_picture.jpg','https://www.cultures-sucre.com/Medias/article/mangue@44f45bdb-c37a-4c1f-adc4-877ef47f4bed.jpg'], true),
('fb4716ad-b486-4b2c-a5d2-fa09d8721d5c', 'f876770d-4006-4997-a4ec-7c700e0c10d7', 'Pommes Golden 1kg', 'Pommes Golden sucrées', 3.20, 50.000, 'kg', ARRAY['https://res.cloudinary.com/keplr/image/upload/v1569572439/production/mon_marche/7440_POMME_GOLDEN.jpg'], true),
('fb4716ad-b486-4b2c-a5d2-fa09d8721d5c', 'f1886207-30bc-49bb-884c-cfac00a270c5', 'Carottes fraîches', 'Carottes bio croquantes', 1.80, 75.000, 'kg', ARRAY['https://back.femininbio.com/attachments/2020/11/20/square/w1000/20864-20864-carrots-673184.jpg'], true),
('fb4716ad-b486-4b2c-a5d2-fa09d8721d5c', 'c0a9b074-76a0-4ea0-835c-e680b1bdb921', 'Miel d acacia 500g', 'Miel pur naturel', 10.00, 20.750, 'L', ARRAY['https://img.passeportsante.net/1200x675/2021-05-03/i102093-miel-nu.webp'], true),
('fb4716ad-b486-4b2c-a5d2-fa09d8721d5c', '00aee39d-43d4-4597-9732-361269837d19', 'Laitue Roma bio', 'Laitue bio fraîche', 1.50, 60.000, 'kg', ARRAY['https://wordpress.potagercity.fr/wp-content/uploads/2019/02/fiche_salade_romaine.jpg'], true);
