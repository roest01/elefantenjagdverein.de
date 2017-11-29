(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['benjamin.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"ele-wrapper benjamin speed"
    + alias4(((helper = (helper = helpers.speed || (depth0 != null ? depth0.speed : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"speed","hash":{},"data":data}) : helper)))
    + " alive killable ka-crash\">\n    <img src=\""
    + alias4(((helper = (helper = helpers.eleFolder || (depth0 != null ? depth0.eleFolder : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"eleFolder","hash":{},"data":data}) : helper)))
    + "benjamin.png\" alt=\"benjamin elephant\">\n</div>\n";
},"useData":true});
templates['default.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"ele-wrapper default speed"
    + alias4(((helper = (helper = helpers.speed || (depth0 != null ? depth0.speed : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"speed","hash":{},"data":data}) : helper)))
    + " alive killable ka-rebound\">\n    <img src=\""
    + alias4(((helper = (helper = helpers.eleFolder || (depth0 != null ? depth0.eleFolder : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"eleFolder","hash":{},"data":data}) : helper)))
    + "default.gif\" alt=\"animated elephant\">\n</div>\n";
},"useData":true});
})();