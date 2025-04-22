checkRole = function checkRole(role) {
    return (req, res, next) => {
      const user = res.locals.user; // This assumes the user is set in res.locals.user via JWT
  
      if (!user) {
        return res.status(401).render("404"); // Redirect to login if user is not authenticated
      }
  
      if (user.role !== role) {
        return res.status(404).render("404"); // Redirect to a 404 page if the role is not admin
      }
  
      next();
    };
  };

  module.exports = checkRole;