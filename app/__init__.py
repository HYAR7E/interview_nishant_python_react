from flask import Flask
from flask_cors import CORS

from app.views.mobile_carrier_view import mobile_carrier_blueprint


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(mobile_carrier_blueprint, url_prefix="/mobile_carrier")

    app.config["UPLOAD_FOLDER"] = f"{app.root_path}/files"
    return app
