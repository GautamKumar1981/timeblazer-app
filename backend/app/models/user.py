class User:
    def __init__(self, _id, name, email):
        self._id = _id
        self.name = name
        self.email = email

    def to_dict(self):
        return {
            '_id': self._id,
            'name': self.name,
            'email': self.email
        }
