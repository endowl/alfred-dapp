"use strict";

function loadHeader() {
  var headerHTML = "<div class=\"brand mr-md\">\n  <a href=\"#\">Gull React</a>\n  <small>v1.0.0</small>\n</div>\n<button type=\"button\" class=\"sidebar-toggle btn rounded-circle btn-raised btn-raised-default btn-icon\" aria-label=\"Close\">\n  <i class=\"ti-menu\"></i>\n  <i class=\"ti-close\"></i>\n</button>\n<span class=\"flex-grow-1\"></span>\n<a href=\"http://gull-react.ui-lib.com/\" class=\"btn btn-link btn-link-secondary mr-md d-none d-sm-block\">Live Preview</a>\n<a href=\"http://githubaccess.ui-lib.com/\" class=\"btn btn-link btn-link-secondary mr-md d-none d-sm-block\">Request GitHub Access</a>\n\n<a href=\"\" class=\"btn btn-raised btn-raised-success\">Buy</a>";

  $(".doc-header").html(headerHTML);

  // Collapsible sidebar
  $(".sidebar-toggle").on("click", function () {
    $(".wrapper").toggleClass("sidebar-open");
  });
}