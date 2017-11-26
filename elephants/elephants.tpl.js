(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['benjamin.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"ele-wrapper benjamin speed"
    + container.escapeExpression(((helper = (helper = helpers.speed || (depth0 != null ? depth0.speed : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"speed","hash":{},"data":data}) : helper)))
    + " alive ka-crash\">\n    <img src=\"elephants/gifs/benjamin.png\" alt=\"benjamin elephant\">\n</div>\n";
},"useData":true});
templates['default.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"ele-wrapper default speed"
    + container.escapeExpression(((helper = (helper = helpers.speed || (depth0 != null ? depth0.speed : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"speed","hash":{},"data":data}) : helper)))
    + " alive ka-rebound\">\n    <img src=\"elephants/gifs/default.gif\" alt=\"\">\n</div>\n";
},"useData":true});
})();