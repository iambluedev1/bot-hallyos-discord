module.exports.hasRole = (member, roles) => {
  for (let roleId of roles) {
    if (member.roles.cache.some((role) => role.id === roleId)) {
      return true;
    }
  }

  return false;
};
