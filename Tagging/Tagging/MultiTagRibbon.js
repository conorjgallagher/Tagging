openMultiTag = function(selectedIds, typename) {
  var w = 380;
  var h = 450;   
  var left = (screen.width/2)-(w/2);
  var top = (screen.height/2)-(h/2);
  var title = 'Content Tagging by xRM Consultancy';
  
  // if you want to pass through optional parameters as per the user guide you can do so like this
  //var dataParam = 'parent=Europe';
    //multiTagWindow = window.open(Xrm.Page.context.getClientUrl() + '/WebResources/xrmc_/MultiTag.html?data='+encodeURIComponent(dataParam), title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
  
  multiTagWindow = window.open(Xrm.Page.context.getClientUrl() + '/WebResources/xrmc_/MultiTag.html', title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
  selectedRowsForMultiTag = selectedIds;
  typenameForMultiTag = typename;
  initMultiTag();
}

initMultiTag = function() {
	if (multiTagWindow.init) {
		multiTagWindow.init(selectedRowsForMultiTag, typenameForMultiTag);
	} else {
		setTimeout(initMultiTag, 100);
	}
}
