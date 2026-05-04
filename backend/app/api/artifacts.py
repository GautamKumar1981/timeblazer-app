from flask import jsonify, request
from app.api import api_bp
from app.api.utils import get_current_user
from app.bazi.artifacts_data import get_all_artifacts, get_artifact_by_id, get_artifacts_by_element


@api_bp.route('/artifacts', methods=['GET'])
def list_artifacts():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401

    element = request.args.get('element')
    if element:
        items = get_artifacts_by_element(element)
    else:
        items = get_all_artifacts()

    return jsonify({'artifacts': items}), 200


@api_bp.route('/artifacts/<int:artifact_id>', methods=['GET'])
def get_artifact(artifact_id):
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401

    artifact = get_artifact_by_id(artifact_id)
    if not artifact:
        return jsonify({'error': 'Artifact not found'}), 404

    return jsonify({'artifact': artifact}), 200
