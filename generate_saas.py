import json
from pathlib import Path
from jinja2 import Environment, FileSystemLoader

# === Setup ===
env = Environment(loader=FileSystemLoader("templates"))

# === 1. Load the JSON spec ===
def load_spec(spec_path):
    with open(spec_path, 'r') as f:
        return json.load(f)

# === 2. Create base directory structure ===
def init_directories():
    print("[*] Creating project structure...")
    base_dirs = [
        "backend/app/models",
        "backend/app/schemas",
        "backend/app/routes",
        "frontend/src/pages",
        "frontend/src/services",
        "frontend/public",
        "templates"
    ]
    for d in base_dirs:
        Path(d).mkdir(parents=True, exist_ok=True)
    print("[✓] Directories ready.")

# === 3. Generate SQLAlchemy models ===
def generate_models(spec):
    print("[*] Generating backend models...")
    model_template = env.get_template("model.py.j2")

    type_mapping = {
        "int": "Integer",
        "string": "String",
        "bool": "Boolean",
        "float": "Float",
        "datetime": "DateTime",
        "date": "Date",
        "time": "Time"
    }

    models = spec.get("models", {})
    for model_name, fields in models.items():
        processed_fields = {}
        for k, v in fields.items():
            if v.startswith("enum"):
                processed_fields[k] = v  # keep enum format
            else:
                processed_fields[k] = type_mapping.get(v, v)

        rendered = model_template.render(
            model_name=model_name,
            fields=processed_fields
        )

        output_path = f"backend/app/models/{model_name.lower()}.py"
        with open(output_path, "w") as f:
            f.write(rendered)
        print(f"[+] Created model: {output_path}")

# === 4. Generate Pydantic schemas ===
def generate_schemas(spec):
    print("[*] Generating Pydantic schemas...")
    schema_template = env.get_template("schema.py.j2")

    type_mapping = {
        "int": "int",
        "string": "str",
        "bool": "bool",
        "float": "float",
        "datetime": "datetime",
        "date": "date",
        "time": "time"
    }

    models = spec.get("models", {})
    for model_name, fields in models.items():
        processed_fields = {}
        for k, v in fields.items():
            if v.startswith("enum"):
                processed_fields[k] = "str"  # use str for enums in Pydantic
            else:
                processed_fields[k] = type_mapping.get(v, v)

        rendered = schema_template.render(
            model_name=model_name,
            fields=processed_fields
        )

        output_path = f"backend/app/schemas/{model_name.lower()}.py"
        with open(output_path, "w") as f:
            f.write(rendered)
        print(f"[+] Created schema: {output_path}")

# === 5. Generate FastAPI routes ===
def generate_routes(spec):
    print("[*] Generating FastAPI route files...")
    route_template = env.get_template("route.py.j2")

    features = spec.get("features", {})
    for role, feature_list in features.items():
        rendered = route_template.render(role=role, features=feature_list)
        output_path = f"backend/app/routes/{role}.py"
        with open(output_path, "w") as f:
            f.write(rendered)
        print(f"[+] Created route: {output_path}")

# === 6. Generate FastAPI main app ===
def generate_main_app(spec):
    print("[*] Generating FastAPI main.py...")
    main_template = env.get_template("main.py.j2")
    rendered = main_template.render(role_files=spec.get("roles", []))
    output_path = "backend/app/main.py"
    with open(output_path, "w") as f:
        f.write(rendered)
    print(f"[+] Created main FastAPI entry: {output_path}")

# === 7. Generate database connection ===
def generate_database():
    print("[*] Generating database connection (SQLite)...")
    db_template = env.get_template("database.py.j2")
    rendered = db_template.render()
    output_path = "backend/app/database.py"
    with open(output_path, "w") as f:
        f.write(rendered)
    print(f"[+] Created database config: {output_path}")

# === 8. Generate init_db.py ===
def generate_init_db(spec):
    print("[*] Generating DB initializer script...")
    init_template = env.get_template("init_db.py.j2")
    model_names = [model.lower() for model in spec.get("models", {}).keys()]
    rendered = init_template.render(model_files=model_names)
    output_path = "backend/app/init_db.py"
    with open(output_path, "w") as f:
        f.write(rendered)
    print(f"[+] Created init_db: {output_path}")

# === MAIN ENTRYPOINT ===
def main():
    spec_path = "specs/second_hire_mvp_spec.json"
    spec = load_spec(spec_path)

    print(f"[*] Loaded spec for project: {spec['project_name']}")
    print(f"[*] Roles: {spec['roles']}")
    print(f"[*] Models: {list(spec['models'].keys())}")
    print(f"[*] Features: {{role: len(spec['features'][role]) for role in spec['features']}}")

    init_directories()
    generate_models(spec)
    generate_schemas(spec)
    generate_routes(spec)
    generate_main_app(spec)
    generate_database()
    generate_init_db(spec)

if __name__ == "__main__":
    main()
