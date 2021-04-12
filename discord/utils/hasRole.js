module.exports.hasRole = (member, roles) => {
  for (let roleName of roles) {
    if (member.roles.cache.some((role) => role.name === roleName)) {
      return true;
    }
  }

  return false;
};
