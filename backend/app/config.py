from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./app.db"
    SECRET_KEY: str = "default-secret-key-change-in-production"
    ENV: str = "development"
    USE_FAKE_GEOCODING: bool = False
    GOOGLE_MAPS_API_KEY: str = "placeholder-google-maps-key"  # ✅ Added for geocoding support
    STRIPE_SECRET_KEY: str = "placeholder-stripe-key"  # ✅ Added for Stripe payment processing

    class Config:
        env_file = ".env"
        extra = "forbid"  # (Optional, but keeps validation strict)


settings = Settings()
