import datetime as dt

from flask import Blueprint, jsonify, request

from app.controller import carrier_report_controller as CarrierReportController

mobile_carrier_blueprint = Blueprint("mobile_carrier", __name__)


@mobile_carrier_blueprint.route("/upload", methods=["POST"])
def view_save_file():
    file = request.files.get("carrier_report", None)
    if file is None:
        return {"errors": "Missing carrier_report file"}, 400
    file_id = CarrierReportController.save_file(file)
    file_id = CarrierReportController.process_carrier_report(file_id)
    return jsonify({"file_id": file_id})


@mobile_carrier_blueprint.route("/location/<string:file_id>", methods=["GET"])
def view_get_location(file_id: str):
    start_str = request.args.get("start", None)  # YYYY-MM-DD
    end_str = request.args.get("end", None)  # YYYY-MM-DD
    if not start_str or not end_str:
        return {"errors": "Missing start or end date"}, 400
    start_date = dt.datetime.strptime(start_str, "%Y-%m-%d").date()
    end_date = dt.datetime.strptime(end_str, "%Y-%m-%d").date()
    location_data_json = CarrierReportController.get_location_data_from_file(
        file_id, start_date, end_date
    )
    return location_data_json, 200
