from flask import jsonify
from app.api import api_bp
from app.api.utils import get_current_user
from app.bazi.stories import get_all_stories, get_stem_story, get_branch_story


@api_bp.route('/stories', methods=['GET'])
def all_stories():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401
    return jsonify(get_all_stories()), 200


@api_bp.route('/stories/stem/<int:stem_index>', methods=['GET'])
def stem_story(stem_index):
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401
    story = get_stem_story(stem_index)
    if not story:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'story': story}), 200


@api_bp.route('/stories/branch/<int:branch_index>', methods=['GET'])
def branch_story(branch_index):
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401
    story = get_branch_story(branch_index)
    if not story:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'story': story}), 200
