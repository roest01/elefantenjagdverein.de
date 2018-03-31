(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['benjamin.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"ele-wrapper benjamin speed"
    + alias4(((helper = (helper = helpers.speed || (depth0 != null ? depth0.speed : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"speed","hash":{},"data":data}) : helper)))
    + " ltr alive killable ka-crash\">\n    <img src=\""
    + alias4(((helper = (helper = helpers.eleFolder || (depth0 != null ? depth0.eleFolder : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"eleFolder","hash":{},"data":data}) : helper)))
    + "benjamin.png\" class=\"eleImg\" alt=\"benjamin elephant\">\n</div>\n";
},"useData":true});
templates['default.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"ele-wrapper default speed"
    + alias4(((helper = (helper = helpers.speed || (depth0 != null ? depth0.speed : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"speed","hash":{},"data":data}) : helper)))
    + " alive killable ltr ka-rebound\">\n    <img src=\""
    + alias4(((helper = (helper = helpers.eleFolder || (depth0 != null ? depth0.eleFolder : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"eleFolder","hash":{},"data":data}) : helper)))
    + "default.gif\" class=\"eleImg\" alt=\"animated elephant\">\n</div>\n";
},"useData":true});
templates['hunter.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.escapeExpression;

  return "<div class=\"ele-wrapper speed"
    + alias1(((helper = (helper = helpers.speed || (depth0 != null ? depth0.speed : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"speed","hash":{},"data":data}) : helper)))
    + " hunter ltr alive\">\n    <span class=\"name\">"
    + alias1(container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.additionalInfo : depth0)) != null ? stack1.player : stack1)) != null ? stack1.name : stack1), depth0))
    + "</span>\n    <div class=\"himage\"></div>\n</div>\n";
},"useData":true});
templates['lia.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"ele-wrapper speed"
    + alias4(((helper = (helper = helpers.speed || (depth0 != null ? depth0.speed : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"speed","hash":{},"data":data}) : helper)))
    + " lia ltr alive killable ka-rotate\">\n    <img src=\""
    + alias4(((helper = (helper = helpers.eleFolder || (depth0 != null ? depth0.eleFolder : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"eleFolder","hash":{},"data":data}) : helper)))
    + "lia.png\" class=\"eleImg\" alt=\"lia elephant\">\n</div>\n";
},"useData":true});
})();