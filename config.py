import os
from dotenv import load_dotenv
from pydantic import BaseSettings

load_dotenv()


BASE_DIR = os.path.dirname(os.path.realpath(__file__))


class Settings(BaseSettings):
    # Private settings -- not seen by frontend
    app_name: str = "FastAPI Face Ratings"
    database_url: str = f"sqlite:///{os.path.join(BASE_DIR, 'database.db')}"
    shuffle: bool = True
    allotted_time: int = 3600  # in seconds
    refresh_time: int = 300  # in seconds
    condition: str = "trustworthy"
    environment_type: str = "debug"
    admin_username: str = "username_to_be_set_in_env_file_not_here"
    admin_password: str = "password_to_be_set_in_env_file_not_here"

    # Public settings -- seen by frontend
    debug_mode: bool = False
    estimated_task_duration: str = "15 minutes"
    compensation: str = "$2.50"
    experiment_title: str = "Example experiment"
    experiment_name: str = "example_experiment"
    version_date: str = "2023-10-21"
    open_tags: str = "[["
    close_tags: str = "]]"
    slider_width: int = 600
    slider_amount_visible: bool = False
    stimulus_width: int = 400
    stimulus_height: int = 400
    num_stimuli: int = 300
    percent_repeats: int = 10
    min_gap_between_repeats: int = 5
    image_dir: str = "images/main/"
    example_image_dir: str = "images/examples/"
    logrocket_id: str = "my-cool-experiment"
    intertrial_interval: int = 100
    reading_speed: int = 0
    show_slider_delay: int = 500

    class Config:
        env_file = ".env"
