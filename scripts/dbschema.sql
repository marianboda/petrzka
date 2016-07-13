CREATE TABLE "ad"(
  "id" Text UNIQUE,
  "title" Text,
  "link" Text,
  "description" Text,
  "area" Real,
  "property_area" Real,
  "type" Text,
  "condition" Text,
  "time_added" Text,
  "location" Text,
  "price" Real,
  "price_energy" Real,
  "price_info" Text,
  "agency" Text,
  "agent" Text,
  "images" Text,
  "rating" Integer DEFAULT 0,
  "time_deleted" Text
);

CREATE TABLE "house"(
  "id" Text UNIQUE,
  "title" Text,
  "link" Text,
  "description" Text,
  "area" Real,
  "property_area" Real,
  "type" Text,
  "condition" Text,
  "time_added" Text,
  "location" Text,
  "price" Real,
  "price_info" Text,
  "agency" Text,
  "agent" Text,
  "images" Text,
  "rating" Integer DEFAULT 0,
  "time_deleted" Text
);

CREATE TABLE "harvests"(
  "id" Text UNIQUE,
  "title" Text,
  "scraper" Text,
  "parameters" Text,
  "time_completed" Text
);
