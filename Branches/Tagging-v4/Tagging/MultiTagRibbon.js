function openMultiTag(selectedIds, typename) {
    var data = encodeURIComponent('t=' + typename + '|e=' + selectedIds.map(e => e.Id).join());
    var windowOptions = { openInNewWindow: true, height: 450, width: 380 };
    Xrm.Navigation.openWebResource('/xrmc_/MultiTag.html', windowOptions, data);
};
