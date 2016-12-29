
class DictionaryMissingValues:
    def __init__(self, dictionary):
        self._dictionary = dictionary

    def get_value(self, key, missing_value=None):
        if not self._dictionary or not key:
            return None

        if key in self._dictionary and self._dictionary[key]:
            return self._dictionary[key]
        else:
            return missing_value

    def dict(self):
        return self._dictionary
