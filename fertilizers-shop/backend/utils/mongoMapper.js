function mapMongoId(data) {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map(item => mapMongoId(item));
  }
  if (typeof data === 'object') {
    const copy = { ...data };
    if (copy.id && !copy._id) {
      copy._id = copy.id;
    }
    // Also handle nested objects if necessary, but shallow should be fine for most API responses
    return copy;
  }
  return data;
}

module.exports = mapMongoId;
