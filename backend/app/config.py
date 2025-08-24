from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ENV: str = "development"
    USE_FAKE_GEOCODING: bool = False
    GOOGLE_MAPS_API_KEY: str  # ✅ Added for geocoding support
    STRIPE_SECRET_KEY: str  # ✅ Added for Stripe payment processing

    class Config:
        env_file = ".env"
        extra = "forbid"  # (Optional, but keeps validation strict)


settings = Settings()
