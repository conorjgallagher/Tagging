//! SparkleXrm.debug.js
// 
var scriptLoader = scriptLoader || {
    delayedLoads: [],
    load: function (name, requires, script) {
        window._loadedScripts = window._loadedScripts || {};
        // Check for loaded scripts, if not all loaded then register delayed Load
        if (requires == null || requires.length == 0 || scriptLoader.areLoaded(requires)) {
            scriptLoader.runScript(name, script);
        }
        else {
            // Register an onload check
            scriptLoader.delayedLoads.push({ name: name, requires: requires, script: script });
        }
    },
    runScript: function (name, script) {      
        script.call(window);
        window._loadedScripts[name] = true;
        scriptLoader.onScriptLoaded(name);
    },
    onScriptLoaded: function (name) {
        // Check for any registered delayed Loads
        scriptLoader.delayedLoads.forEach(function (script) {
            if (script.loaded == null && scriptLoader.areLoaded(script.requires)) {
                script.loaded = true;
                scriptLoader.runScript(script.name, script.script);
            }
        });
    },
    areLoaded: function (requires) {
        var allLoaded = true;
        for (var i = 0; i < requires.length; i++) {
			var isLoaded = (window._loadedScripts[requires[i]] != null);
            allLoaded = allLoaded && isLoaded;
            if (!allLoaded)
                break;
        }
        return allLoaded;
    }
};
 
scriptLoader.load("xrm", ["mscorlib"], function () {


Type.registerNamespace('SparkleXrm');

Type.registerNamespace('SparkleXrm.Xrm');

Type.registerNamespace('Xrm');

////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.ArrayEx

SparkleXrm.ArrayEx = function SparkleXrm_ArrayEx() {
}
SparkleXrm.ArrayEx.add = function SparkleXrm_ArrayEx$add(list, item) {
    list[list.length]=item;
}
SparkleXrm.ArrayEx.getEnumerator = function SparkleXrm_ArrayEx$getEnumerator(list) {
    return new ss.ArrayEnumerator(list);
}
SparkleXrm.ArrayEx.join = function SparkleXrm_ArrayEx$join(list, delimeter) {
    var result = '';
    for (var i = 0; i < list.length; i++) {
        if (i > 0) {
            result += delimeter;
        }
        result += list[i];
    }
    return result;
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.DelegateItterator

SparkleXrm.DelegateItterator = function SparkleXrm_DelegateItterator() {
}
SparkleXrm.DelegateItterator.callbackItterate = function SparkleXrm_DelegateItterator$callbackItterate(action, numberOfTimes, completeCallBack, errorCallBack) {
    SparkleXrm.DelegateItterator._callbackItterateAction(action, 0, numberOfTimes, completeCallBack, errorCallBack);
}
SparkleXrm.DelegateItterator._callbackItterateAction = function SparkleXrm_DelegateItterator$_callbackItterateAction(action, index, numberOfTimes, completeCallBack, errorCallBack) {
    if (index < numberOfTimes) {
        try {
            action(index, function() {
                index++;
                SparkleXrm.DelegateItterator._callbackItterateAction(action, index, numberOfTimes, completeCallBack, errorCallBack);
            }, function(ex) {
                errorCallBack(ex);
            });
        }
        catch (ex) {
            errorCallBack(ex);
        }
    }
    else {
        completeCallBack();
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.NumberEx

SparkleXrm.NumberEx = function SparkleXrm_NumberEx() {
}
SparkleXrm.NumberEx.parse = function SparkleXrm_NumberEx$parse(value, format) {
    if (String.isNullOrEmpty(value)) {
        return null;
    }
    value = value.replaceAll(' ', '');
    value = value.replaceAll(format.numberSepartor, '');
    if (format.decimalSymbol !== '.') {
        value = value.replaceAll(format.decimalSymbol, '.');
    }
    if (value.startsWith('(')) {
        value = '-' + value.replaceAll('(', '').replaceAll(')', '');
    }
    else if (value.endsWith('-')) {
        value = '-' + value.substring(0, value.length - 1);
    }
    var numericValue = Number.parse(value);
    return numericValue;
}
SparkleXrm.NumberEx.getNumberFormatInfo = function SparkleXrm_NumberEx$getNumberFormatInfo() {
    var format = {};
    if (SparkleXrm.Sdk.OrganizationServiceProxy.userSettings != null) {
        format.decimalSymbol = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.decimalsymbol;
        format.numberGroupFormat = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.numbergroupformat;
        format.numberSepartor = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.numberseparator;
        format.negativeFormatCode = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.negativeformatcode;
    }
    else {
        format.decimalSymbol = '.';
        format.numberGroupFormat = '3';
        format.numberSepartor = ',';
        format.negativeFormatCode = 0;
    }
    format.precision = 2;
    format.minValue = -2147483648;
    format.maxValue = 2147483648;
    return format;
}
SparkleXrm.NumberEx.getCurrencyEditFormatInfo = function SparkleXrm_NumberEx$getCurrencyEditFormatInfo() {
    var format = {};
    if (SparkleXrm.Sdk.OrganizationServiceProxy.userSettings != null) {
        format.decimalSymbol = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.decimalsymbol;
        format.numberGroupFormat = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.numbergroupformat;
        format.numberSepartor = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.numberseparator;
        format.negativeFormatCode = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.negativecurrencyformatcode;
        format.precision = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.currencydecimalprecision;
        format.currencySymbol = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.currencysymbol;
    }
    else {
        format.decimalSymbol = '.';
        format.numberGroupFormat = '3';
        format.numberSepartor = ',';
        format.negativeFormatCode = 0;
        format.precision = 2;
        format.currencySymbol = '$';
    }
    return format;
}
SparkleXrm.NumberEx.getCurrencyFormatInfo = function SparkleXrm_NumberEx$getCurrencyFormatInfo() {
    var format = {};
    if (SparkleXrm.Sdk.OrganizationServiceProxy.userSettings != null) {
        format.decimalSymbol = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.decimalsymbol;
        format.numberGroupFormat = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.numbergroupformat;
        format.numberSepartor = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.numberseparator;
        format.negativeFormatCode = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.negativecurrencyformatcode;
        format.precision = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.currencydecimalprecision;
        format.currencySymbol = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.currencysymbol;
    }
    else {
        format.decimalSymbol = '.';
        format.numberGroupFormat = '3';
        format.numberSepartor = ',';
        format.negativeFormatCode = 0;
        format.precision = 2;
        format.currencySymbol = '$';
    }
    return format;
}
SparkleXrm.NumberEx.format = function SparkleXrm_NumberEx$format(actualValue, format) {
    if (actualValue == null) {
        return '';
    }
    var value = actualValue;
    var numberGroupFormats = format.numberGroupFormat.split(',');
    var formattedNumber = '';
    if (format.precision != null) {
        value.toFixed(format.precision);
    }
    var wholeNumber = Math.floor(Math.abs(value));
    var wholeNumberString = wholeNumber.toString();
    var decimalPartString = value.toString().substr(wholeNumberString.length + 1 + ((value < 0) ? 1 : 0));
    var i = wholeNumberString.length;
    var j = 0;
    while (i > 0) {
        var groupSize = parseInt(numberGroupFormats[j]);
        if (j < (numberGroupFormats.length - 1)) {
            j++;
        }
        if (!groupSize) {
            groupSize = i + 1;
        }
        formattedNumber = wholeNumberString.substring(i, i - groupSize) + formattedNumber;
        if (i > groupSize) {
            formattedNumber = format.numberSepartor + formattedNumber;
        }
        i = i - groupSize;
    }
    var neg = (value < 0);
    if (format.precision > 0) {
        var paddingRequired = format.precision - decimalPartString.length;
        for (var d = 0; d < paddingRequired; d++) {
            decimalPartString = decimalPartString + '0';
        }
        formattedNumber = formattedNumber + format.decimalSymbol + decimalPartString;
    }
    if (neg) {
        switch (format.negativeFormatCode) {
            case 0:
                formattedNumber = '(' + formattedNumber + ')';
                break;
            case 2:
                formattedNumber = '- ' + formattedNumber;
                break;
            case 3:
                formattedNumber = formattedNumber + '-';
                break;
            case 4:
                formattedNumber = formattedNumber + ' -';
                break;
            case 1:
            default:
                formattedNumber = '-' + formattedNumber;
                break;
        }
    }
    return formattedNumber;
}
SparkleXrm.NumberEx.round = function SparkleXrm_NumberEx$round(numericValue, precision) {
    var precisionMultiplier = 1;
    if (precision > 0) {
        precisionMultiplier = Math.pow(10, precision);
    }
    return Math.round(numericValue * precisionMultiplier) / precisionMultiplier;
}
SparkleXrm.NumberEx.getCurrencySymbol = function SparkleXrm_NumberEx$getCurrencySymbol(currencyId) {
    var orgSettings = SparkleXrm.Services.CachedOrganizationService.retrieveMultiple("<fetch distinct='false' no-lock='false' mapping='logical'><entity name='organization'><attribute name='currencydisplayoption' /><attribute name='currencysymbol' /></entity></fetch>");
    var orgSetting = orgSettings.entities.get_item(0);
    var currency = SparkleXrm.Services.CachedOrganizationService.retrieve('transactioncurrency', currencyId.toString(), [ 'currencysymbol', 'isocurrencycode' ]);
    if (!orgSetting.getAttributeValueOptionSet('currencydisplayoption').value) {
        return currency.getAttributeValueString('currencysymbol') + ' ';
    }
    else {
        return currency.getAttributeValueString('isocurrencycode') + ' ';
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Xrm.PageEx

SparkleXrm.Xrm.PageEx = function SparkleXrm_Xrm_PageEx() {
}
SparkleXrm.Xrm.PageEx.getCacheKey = function SparkleXrm_Xrm_PageEx$getCacheKey() {
    var regex = new RegExp('%7b[0-9]*%7d(?=\\/webresources)', 'g');
    var match = regex.exec(window.location.href);
    if (match != null && match.length > 0) {
        return match[0] + '/';
    }
    return '';
}
SparkleXrm.Xrm.PageEx.getWebResourceData = function SparkleXrm_Xrm_PageEx$getWebResourceData() {
    var queryString = window.location.search;
    if (queryString != null && !!queryString) {
        var parameters = queryString.substr(1).split('&');
        var $enum1 = ss.IEnumerator.getEnumerator(parameters);
        while ($enum1.moveNext()) {
            var param = $enum1.current;
            if (param.toLowerCase().startsWith('data=')) {
                var dataParam = param.replaceAll('+', ' ').split('=');
                return SparkleXrm.Xrm.PageEx._parseDataParameter(dataParam[1]);
            }
        }
    }
    return {};
}
SparkleXrm.Xrm.PageEx._parseDataParameter = function SparkleXrm_Xrm_PageEx$_parseDataParameter(data) {
    var nameValuePairs = {};
    var values = (decodeURIComponent(data)).split('&');
    var $enum1 = ss.IEnumerator.getEnumerator(values);
    while ($enum1.moveNext()) {
        var value = $enum1.current;
        var nameValuePair = value.split('=');
        nameValuePairs[nameValuePair[0]] = nameValuePair[1];
    }
    return nameValuePairs;
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.StringEx

SparkleXrm.StringEx = function SparkleXrm_StringEx() {
}
SparkleXrm.StringEx.IN = function SparkleXrm_StringEx$IN(value, values) {
    if (value != null) {
        var $enum1 = ss.IEnumerator.getEnumerator(values);
        while ($enum1.moveNext()) {
            var val = $enum1.current;
            if (value === val) {
                return true;
            }
        }
    }
    return false;
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.TaskIterrator

SparkleXrm.TaskIterrator = function SparkleXrm_TaskIterrator() {
    this._tasks = [];
}
SparkleXrm.TaskIterrator.prototype = {
    _errorCallBack: null,
    _successCallBack: null,
    
    addTask: function SparkleXrm_TaskIterrator$addTask(task, state) {
        var queued = {};
        queued.task = task;
        queued.state = state;
        this._tasks.add(queued);
    },
    
    start: function SparkleXrm_TaskIterrator$start(successCallBack, errorCallBack) {
        this._errorCallBack = errorCallBack;
        this._successCallBack = successCallBack;
        this._completeCallBack();
    },
    
    _completeCallBack: function SparkleXrm_TaskIterrator$_completeCallBack() {
        var nextAction = this._tasks[0];
        if (nextAction != null) {
            this._tasks.remove(nextAction);
            nextAction.task(ss.Delegate.create(this, this._completeCallBack), this._errorCallBack, nextAction.state);
        }
        else {
            if (this._successCallBack != null) {
                this._successCallBack();
            }
        }
    }
}


Type.registerNamespace('SparkleXrm.ComponentModel');

////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.ComponentModel.INotifyPropertyChanged

SparkleXrm.ComponentModel.INotifyPropertyChanged = function() { };
SparkleXrm.ComponentModel.INotifyPropertyChanged.prototype = {
    add_propertyChanged : null,
    remove_propertyChanged : null,
    raisePropertyChanged : null
}
SparkleXrm.ComponentModel.INotifyPropertyChanged.registerInterface('SparkleXrm.ComponentModel.INotifyPropertyChanged');


Type.registerNamespace('SparkleXrm.Sdk');

Type.registerNamespace('Xrm.Sdk');


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.EntityStates

SparkleXrm.Sdk.EntityStates = function() { };
SparkleXrm.Sdk.EntityStates.prototype = {
    unchanged: 0, 
    created: 1, 
    changed: 2, 
    deleted: 3, 
    readOnly: 4
}
SparkleXrm.Sdk.EntityStates.registerEnum('SparkleXrm.Sdk.EntityStates', false);


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.EntityRole

SparkleXrm.Sdk.EntityRole = function() { };
SparkleXrm.Sdk.EntityRole.prototype = {
    referencing: 0, 
    referenced: 1
}
SparkleXrm.Sdk.EntityRole.registerEnum('SparkleXrm.Sdk.EntityRole', false);


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.ColumnSet

SparkleXrm.Sdk.ColumnSet = function SparkleXrm_Sdk_ColumnSet(columns) {
    if (Type.getInstanceType(columns) === Boolean) {
        this.allColumns = columns;
    }
    else {
        this.columns = columns;
    }
}
SparkleXrm.Sdk.ColumnSet.prototype = {
    allColumns: false,
    columns: null
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Attribute

SparkleXrm.Sdk.Attribute = function SparkleXrm_Sdk_Attribute(attributeName, typeName) {
    this.attributeName = attributeName;
    this.typeName = typeName;
    this.formattedValue = null;
    this.value = null;
    this.id = null;
    this.logicalName = null;
    this.name = null;
}
SparkleXrm.Sdk.Attribute.deSerialise = function SparkleXrm_Sdk_Attribute$deSerialise(node, overrideType) {
    var isNil = (SparkleXrm.Sdk.XmlHelper.getAttributeValue(node, 'i:nil') === 'true');
    var value = null;
    if (!isNil) {
        var typeName = overrideType;
        if (typeName == null) {
            typeName = SparkleXrm.Sdk.Attribute._removeNsPrefix(SparkleXrm.Sdk.XmlHelper.getAttributeValue(node, 'i:type'));
        }
        var stringValue = SparkleXrm.Sdk.XmlHelper.getNodeTextValue(node);
        switch (typeName) {
            case 'EntityReference':
                var entityReferenceValue = new SparkleXrm.Sdk.EntityReference(new SparkleXrm.Sdk.Guid(SparkleXrm.Sdk.XmlHelper.selectSingleNodeValue(node, 'Id')), SparkleXrm.Sdk.XmlHelper.selectSingleNodeValue(node, 'LogicalName'), SparkleXrm.Sdk.XmlHelper.selectSingleNodeValue(node, 'Name'));
                value = entityReferenceValue;
                break;
            case 'AliasedValue':
                value = SparkleXrm.Sdk.Attribute.deSerialise(SparkleXrm.Sdk.XmlHelper.selectSingleNode(node, 'Value'), null);
                break;
            case 'boolean':
                value = (stringValue === 'true');
                break;
            case 'double':
                value = parseFloat(stringValue);
                break;
            case 'decimal':
                value = parseFloat(stringValue);
                break;
            case 'dateTime':
                var dateValue = SparkleXrm.Sdk.DateTimeEx.parse(stringValue);
                var settings = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings;
                if (settings != null) {
                    dateValue.setTime(dateValue.getTime() + (dateValue.getTimezoneOffset() * 60 * 1000));
                    var localDateValue = SparkleXrm.Sdk.DateTimeEx.utcToLocalTimeFromSettings(dateValue, settings);
                    value = localDateValue;
                }
                else {
                    value = dateValue;
                }
                break;
            case 'guid':
                value = new SparkleXrm.Sdk.Guid(stringValue);
                break;
            case 'int':
                value = parseInt(stringValue);
                break;
            case 'OptionSetValue':
                value = SparkleXrm.Sdk.OptionSetValue.parse(SparkleXrm.Sdk.XmlHelper.selectSingleNodeValue(node, 'Value'));
                break;
            case 'Money':
                value = new SparkleXrm.Sdk.Money(parseFloat(SparkleXrm.Sdk.XmlHelper.selectSingleNodeValue(node, 'Value')));
                break;
            case 'EntityCollection':
                value = SparkleXrm.Sdk.EntityCollection.deSerialise(node);
                break;
            default:
                value = stringValue;
                break;
        }
    }
    return value;
}
SparkleXrm.Sdk.Attribute.serialise = function SparkleXrm_Sdk_Attribute$serialise(attributeName, value, metaData) {
    var xml = '<a:KeyValuePairOfstringanyType><b:key>' + attributeName + '</b:key>';
    var typeName = Type.getInstanceType(value).get_name();
    if (value != null && metaData != null && Object.keyExists(metaData, attributeName)) {
        typeName = metaData[attributeName];
    }
    xml += SparkleXrm.Sdk.Attribute.serialiseValue(value, typeName);
    xml += '</a:KeyValuePairOfstringanyType>';
    return xml;
}
SparkleXrm.Sdk.Attribute.serialiseValue = function SparkleXrm_Sdk_Attribute$serialiseValue(value, overrideTypeName) {
    var valueXml = '';
    var typeName = overrideTypeName;
    if (typeName == null) {
        typeName = Type.getInstanceType(value).get_name();
    }
    switch (typeName) {
        case 'String':
            valueXml += '<b:value i:type="' + SparkleXrm.Sdk.Attribute._addNsPrefix('string') + '" xmlns:c="http://www.w3.org/2001/XMLSchema">';
            valueXml += SparkleXrm.Sdk.XmlHelper.encode(value);
            valueXml += '</b:value>';
            break;
        case 'Boolean':
        case 'bool':
            valueXml += '<b:value i:type="' + SparkleXrm.Sdk.Attribute._addNsPrefix('boolean') + '" xmlns:c="http://www.w3.org/2001/XMLSchema">';
            valueXml += SparkleXrm.Sdk.XmlHelper.encode(value.toString());
            valueXml += '</b:value>';
            break;
        case 'Date':
            var dateValue = value;
            var dateString = null;
            var settings = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings;
            if (settings != null) {
                var utcDateValue = SparkleXrm.Sdk.DateTimeEx.localTimeToUTCFromSettings(dateValue, settings);
                dateString = SparkleXrm.Sdk.DateTimeEx.toXrmString(utcDateValue);
            }
            else {
                dateString = SparkleXrm.Sdk.DateTimeEx.toXrmStringUTC(dateValue);
            }
            valueXml += '<b:value i:type="' + SparkleXrm.Sdk.Attribute._addNsPrefix('dateTime') + '" xmlns:c="http://www.w3.org/2001/XMLSchema">';
            valueXml += SparkleXrm.Sdk.XmlHelper.encode(dateString);
            valueXml += '</b:value>';
            break;
        case 'decimal':
            valueXml += '<b:value i:type="' + SparkleXrm.Sdk.Attribute._addNsPrefix('decimal') + '" xmlns:c="http://www.w3.org/2001/XMLSchema">';
            var decStringValue = null;
            if (value != null) {
                decStringValue = value.toString();
            }
            valueXml += SparkleXrm.Sdk.XmlHelper.encode(decStringValue);
            valueXml += '</b:value>';
            break;
        case 'double':
            valueXml += '<b:value i:type="' + SparkleXrm.Sdk.Attribute._addNsPrefix('double') + '" xmlns:c="http://www.w3.org/2001/XMLSchema">';
            var doubleStringValue = null;
            if (value != null) {
                doubleStringValue = value.toString();
            }
            valueXml += SparkleXrm.Sdk.XmlHelper.encode(doubleStringValue);
            valueXml += '</b:value>';
            break;
        case 'int':
            valueXml += '<b:value i:type="' + SparkleXrm.Sdk.Attribute._addNsPrefix('int') + '" xmlns:c="http://www.w3.org/2001/XMLSchema">';
            var intStringValue = null;
            if (value != null) {
                intStringValue = parseInt(value).toString();
            }
            valueXml += SparkleXrm.Sdk.XmlHelper.encode(intStringValue);
            valueXml += '</b:value>';
            break;
        case 'Guid':
            valueXml += '<b:value i:type="' + SparkleXrm.Sdk.Attribute._addNsPrefix('guid') + '" xmlns:c="http://schemas.microsoft.com/2003/10/Serialization/">';
            valueXml += (value).value;
            valueXml += '</b:value>';
            break;
        case 'EntityReference':
            var entityReferenceValue = value;
            valueXml += '<b:value i:type="' + SparkleXrm.Sdk.Attribute._addNsPrefix(typeName) + '">';
            valueXml += '<a:Id>' + entityReferenceValue.id + '</a:Id><a:LogicalName>' + entityReferenceValue.logicalName + '</a:LogicalName>';
            valueXml += '</b:value>';
            break;
        case 'OptionSetValue':
            var opt = value;
            if (opt.value != null) {
                valueXml += '<b:value i:type="' + SparkleXrm.Sdk.Attribute._addNsPrefix(typeName) + '">';
                valueXml += '<a:Value>' + opt.value + '</a:Value>';
                valueXml += '</b:value>';
            }
            else {
                valueXml += '<b:value i:type="' + SparkleXrm.Sdk.Attribute._addNsPrefix(typeName) + '" i:nil="true"/>';
            }
            break;
        case 'EntityCollection':
            valueXml += '<b:value i:type="' + SparkleXrm.Sdk.Attribute._addNsPrefix(typeName) + '">';
            valueXml += SparkleXrm.Sdk.EntityCollection.serialise(value);
            valueXml += '</b:value>';
            break;
        case 'Money':
            var money = value;
            if (money != null && money.value != null) {
                valueXml += '<b:value i:type="' + SparkleXrm.Sdk.Attribute._addNsPrefix(typeName) + '">';
                valueXml += '<a:Value>' + money.value.toString() + '</a:Value>';
                valueXml += '</b:value>';
            }
            else {
                valueXml += '<b:value i:type="' + SparkleXrm.Sdk.Attribute._addNsPrefix(typeName) + '" i:nil="true"/>';
            }
            break;
        case 'EntityFilters':
            var entityFilterValue = value;
            var entityFilterValues = [];
            if ((1 & entityFilterValue) === 1) {
                entityFilterValues.add('Entity');
            }
            if ((2 & entityFilterValue) === 2) {
                entityFilterValues.add('Attributes');
            }
            if ((4 & entityFilterValue) === 4) {
                entityFilterValues.add('Privileges');
            }
            if ((8 & entityFilterValue) === 8) {
                entityFilterValues.add('Relationships');
            }
            valueXml += '<b:value i:type="c:EntityFilters" xmlns:c="http://schemas.microsoft.com/xrm/2011/Metadata">' + SparkleXrm.Sdk.XmlHelper.encode(entityFilterValues.join(' ')) + '</b:value>';
            break;
        default:
            valueXml += '<b:value i:nil="true"/>';
            break;
    }
    return valueXml;
}
SparkleXrm.Sdk.Attribute._removeNsPrefix = function SparkleXrm_Sdk_Attribute$_removeNsPrefix(node) {
    var i = node.indexOf(':');
    return node.substring(i + 1, node.length - i + 1);
}
SparkleXrm.Sdk.Attribute._addNsPrefix = function SparkleXrm_Sdk_Attribute$_addNsPrefix(type) {
    switch (type) {
        case 'String':
        case 'Guid':
        case 'DateTime':
        case 'string':
        case 'decimal':
        case 'double':
        case 'boolean':
        case 'dateTime':
        case 'guid':
        case 'int':
            return 'c:' + type;
        case 'EntityReference':
        case 'OptionSetValue':
        case 'AliasedValue':
        case 'EntityCollection':
        case 'Money':
            return 'a:' + type;
    }
    throw new Error('Could not add node prefix for type ' + type);
}
SparkleXrm.Sdk.Attribute._serialiseWebApiAttribute = function SparkleXrm_Sdk_Attribute$_serialiseWebApiAttribute(attributeType, attributeValue, callback, errorCallBack, async) {
    var parameterType = Type.getInstanceType(attributeValue);
    if (parameterType === SparkleXrm.Sdk.EntityReference) {
        var entityRef = {};
        var parameterEntityref = attributeValue;
        if (parameterEntityref.id == null || parameterEntityref.id.value == null) {
            throw new Error('Id not set on EntityReference');
        }
        SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getEntityMetadata(parameterEntityref.logicalName, function(metadata) {
            var entitySetName = metadata.entitySetName;
            entityRef['@odata.id'] = SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getResource(entitySetName, parameterEntityref.id.value);
            entityRef['logicalName'] = parameterEntityref.logicalName;
            callback(entityRef);
        }, errorCallBack, async);
    }
    else if (parameterType === SparkleXrm.Sdk.EntityCollection) {
        var collection = attributeValue;
        SparkleXrm.Sdk.EntityCollection.serialiseWebApi(collection, callback, errorCallBack, async);
    }
    else if (parameterType === SparkleXrm.Sdk.Entity) {
        var entity = attributeValue;
        SparkleXrm.Sdk.Entity._serialiseWebApi(entity, callback, errorCallBack, async);
    }
    else if (parameterType === SparkleXrm.Sdk.OptionSetValue) {
        var optionValue = attributeValue;
        callback(optionValue.value);
    }
    else if (parameterType === SparkleXrm.Sdk.Guid) {
        var guidValue = attributeValue;
        callback(guidValue.value);
    }
    else if (parameterType === SparkleXrm.Sdk.Money) {
        var moneyValue = attributeValue;
        callback(moneyValue.value);
    }
    else {
        callback(attributeValue);
    }
}
SparkleXrm.Sdk.Attribute.prototype = {
    attributeName: null,
    typeName: null,
    formattedValue: null,
    value: null,
    id: null,
    logicalName: null,
    name: null
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.AttributeTypes

SparkleXrm.Sdk.AttributeTypes = function SparkleXrm_Sdk_AttributeTypes() {
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.OrganizationSettings

SparkleXrm.Sdk.OrganizationSettings = function SparkleXrm_Sdk_OrganizationSettings() {
    SparkleXrm.Sdk.OrganizationSettings.initializeBase(this, [ SparkleXrm.Sdk.OrganizationSettings.entityLogicalName ]);
}
SparkleXrm.Sdk.OrganizationSettings.prototype = {
    weekstartdaycode: null
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.UserSettingsAttributes

SparkleXrm.Sdk.UserSettingsAttributes = function SparkleXrm_Sdk_UserSettingsAttributes() {
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.UserSettings

SparkleXrm.Sdk.UserSettings = function SparkleXrm_Sdk_UserSettings() {
    SparkleXrm.Sdk.UserSettings.initializeBase(this, [ SparkleXrm.Sdk.UserSettings.entityLogicalName ]);
}
SparkleXrm.Sdk.UserSettings.prototype = {
    usersettingsid: null,
    businessunitid: null,
    calendartype: null,
    currencydecimalprecision: null,
    currencyformatcode: null,
    currencysymbol: null,
    dateformatcode: null,
    dateformatstring: null,
    dateseparator: null,
    decimalsymbol: null,
    defaultcalendarview: null,
    defaultdashboardid: null,
    localeid: null,
    longdateformatcode: null,
    negativecurrencyformatcode: null,
    negativeformatcode: null,
    numbergroupformat: null,
    numberseparator: null,
    offlinesyncinterval: null,
    pricingdecimalprecision: null,
    showweeknumber: null,
    systemuserid: null,
    timeformatcodestring: null,
    timeformatstring: null,
    timeseparator: null,
    timezonebias: null,
    timezonecode: null,
    timezonedaylightbias: null,
    timezonedaylightday: null,
    timezonedaylightdayofweek: null,
    timezonedaylighthour: null,
    timezonedaylightminute: null,
    timezonedaylightmonth: null,
    timezonedaylightsecond: null,
    timezonedaylightyear: null,
    timezonestandardbias: null,
    timezonestandardday: null,
    timezonestandarddayofweek: null,
    timezonestandardhour: null,
    timezonestandardminute: null,
    timezonestandardmonth: null,
    timezonestandardsecond: null,
    timezonestandardyear: null,
    transactioncurrencyid: null,
    uilanguageid: null,
    workdaystarttime: null,
    workdaystoptime: null,
    
    getNumberFormatString: function SparkleXrm_Sdk_UserSettings$getNumberFormatString(decimalPlaces) {
        return '###,###,###.000';
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.DataCollectionOfEntity

SparkleXrm.Sdk.DataCollectionOfEntity = function SparkleXrm_Sdk_DataCollectionOfEntity(entities) {
    this._internalArray = entities;
}
SparkleXrm.Sdk.DataCollectionOfEntity.prototype = {
    _internalArray: null,
    
    items: function SparkleXrm_Sdk_DataCollectionOfEntity$items() {
        return this._internalArray;
    },
    
    getEnumerator: function SparkleXrm_Sdk_DataCollectionOfEntity$getEnumerator() {
        return SparkleXrm.ArrayEx.getEnumerator(this._internalArray);
    },
    
    get_count: function SparkleXrm_Sdk_DataCollectionOfEntity$get_count() {
        return this._internalArray.length;
    },
    get_item: function SparkleXrm_Sdk_DataCollectionOfEntity$get_item(i) {
        return this._internalArray[i];
    },
    set_item: function SparkleXrm_Sdk_DataCollectionOfEntity$set_item(i, value) {
        this._internalArray[i] = value;
        return value;
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.DateTimeEx

SparkleXrm.Sdk.DateTimeEx = function SparkleXrm_Sdk_DateTimeEx() {
}
SparkleXrm.Sdk.DateTimeEx.toXrmString = function SparkleXrm_Sdk_DateTimeEx$toXrmString(date) {
    var month = SparkleXrm.Sdk.DateTimeEx._padNumber(date.getMonth() + 1, 2);
    var day = SparkleXrm.Sdk.DateTimeEx._padNumber(date.getDate(), 2);
    var hours = SparkleXrm.Sdk.DateTimeEx._padNumber(date.getHours(), 2);
    var mins = SparkleXrm.Sdk.DateTimeEx._padNumber(date.getMinutes(), 2);
    var secs = SparkleXrm.Sdk.DateTimeEx._padNumber(date.getSeconds(), 2);
    return String.format('{0}-{1}-{2}T{3}:{4}:{5}Z', date.getFullYear(), month, day, hours, mins, secs);
}
SparkleXrm.Sdk.DateTimeEx.toXrmStringUTC = function SparkleXrm_Sdk_DateTimeEx$toXrmStringUTC(date) {
    var month = SparkleXrm.Sdk.DateTimeEx._padNumber(date.getUTCMonth() + 1, 2);
    var day = SparkleXrm.Sdk.DateTimeEx._padNumber(date.getUTCDate(), 2);
    var hours = SparkleXrm.Sdk.DateTimeEx._padNumber(date.getUTCHours(), 2);
    var mins = SparkleXrm.Sdk.DateTimeEx._padNumber(date.getUTCMinutes(), 2);
    var secs = SparkleXrm.Sdk.DateTimeEx._padNumber(date.getUTCSeconds(), 2);
    return String.format('{0}-{1}-{2}T{3}:{4}:{5}Z', date.getUTCFullYear(), month, day, hours, mins, secs);
}
SparkleXrm.Sdk.DateTimeEx._padNumber = function SparkleXrm_Sdk_DateTimeEx$_padNumber(number, length) {
    var str = number.toString();
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}
SparkleXrm.Sdk.DateTimeEx.parse = function SparkleXrm_Sdk_DateTimeEx$parse(dateString) {
    if (!String.isNullOrEmpty(dateString)) {
        var dateTimeParsed = (Date.parseDate(dateString));
        return dateTimeParsed;
    }
    else {
        return null;
    }
}
SparkleXrm.Sdk.DateTimeEx.formatDuration = function SparkleXrm_Sdk_DateTimeEx$formatDuration(totalMinutes) {
    if (totalMinutes != null) {
        var toatalSeconds = totalMinutes * 60;
        var days = Math.floor(toatalSeconds / 86400);
        var hours = Math.floor((toatalSeconds % 86400) / 3600);
        var minutes = Math.floor(((toatalSeconds % 86400) % 3600) / 60);
        var seconds = ((toatalSeconds % 86400) % 3600) % 60;
        var formatString = [];
        if (days > 0) {
            SparkleXrm.ArrayEx.add(formatString, '{0}d');
        }
        if (hours > 0) {
            SparkleXrm.ArrayEx.add(formatString, '{1}h');
        }
        if (minutes > 0) {
            SparkleXrm.ArrayEx.add(formatString, '{2}m');
        }
        if (!days && !hours && !minutes) {
            SparkleXrm.ArrayEx.add(formatString, '{2}m');
        }
        return String.format(SparkleXrm.ArrayEx.join(formatString, ' '), days, hours, minutes);
    }
    else {
        return '';
    }
}
SparkleXrm.Sdk.DateTimeEx.parseDuration = function SparkleXrm_Sdk_DateTimeEx$parseDuration(duration) {
    var isEmpty = (duration == null) || (!duration.length);
    if (isEmpty) {
        return null;
    }
    var pattern = '/([0-9.]*)[ ]?((h(our)?[s]?)|(m(inute)?[s]?)|(d(ay)?[s]?))/g';
    var regex = RegExp.parse(pattern);
    var matched = false;
    var thisMatch = false;
    var totalDuration = 0;
    do {
        var match = regex.exec(duration);
        thisMatch = (match != null && match.length > 0);
        matched = matched || thisMatch;
        if (thisMatch) {
            var durationNumber = parseFloat(match[1]);
            switch (match[2].substr(0, 1).toLowerCase()) {
                case 'd':
                    durationNumber = durationNumber * 60 * 24;
                    break;
                case 'h':
                    durationNumber = durationNumber * 60;
                    break;
            }
            totalDuration += Math.floor(durationNumber);
            duration.replaceAll(match[0], '');
        }
    } while (thisMatch);
    if (matched) {
        return totalDuration;
    }
    else {
        return null;
    }
}
SparkleXrm.Sdk.DateTimeEx.addTimeToDate = function SparkleXrm_Sdk_DateTimeEx$addTimeToDate(date, time) {
    if (date == null) {
        date = Date.get_now();
    }
    if (time != null) {
        var dateWithTime = Date.parseDate('01 Jan 2000 ' + time.replaceAll('.', ':').replaceAll('-', ':').replaceAll(',', ':'));
        var newDate = new Date(date.getTime());
        if (!isNaN((dateWithTime))) {
            newDate.setHours(dateWithTime.getHours());
            newDate.setMinutes(dateWithTime.getMinutes());
            newDate.setSeconds(dateWithTime.getSeconds());
            newDate.setMilliseconds(dateWithTime.getMilliseconds());
            return newDate;
        }
        return null;
    }
    return date;
}
SparkleXrm.Sdk.DateTimeEx.localTimeToUTCFromSettings = function SparkleXrm_Sdk_DateTimeEx$localTimeToUTCFromSettings(LocalTime, settings) {
    return SparkleXrm.Sdk.DateTimeEx.localTimeToUTC(LocalTime, settings.timezonebias, settings.timezonedaylightbias, settings.timezonedaylightyear, settings.timezonedaylightmonth, settings.timezonedaylightday, settings.timezonedaylighthour, settings.timezonedaylightminute, settings.timezonedaylightsecond, 0, settings.timezonedaylightdayofweek, settings.timezonestandardbias, settings.timezonestandardyear, settings.timezonestandardmonth, settings.timezonestandardday, settings.timezonestandardhour, settings.timezonestandardminute, settings.timezonestandardsecond, 0, settings.timezonestandarddayofweek);
}
SparkleXrm.Sdk.DateTimeEx.localTimeToUTC = function SparkleXrm_Sdk_DateTimeEx$localTimeToUTC(LocalTime, Bias, DaylightBias, DaylightYear, DaylightMonth, DaylightDay, DaylightHour, DaylightMinute, DaylightSecond, DaylightMilliseconds, DaylightWeekday, StandardBias, StandardYear, StandardMonth, StandardDay, StandardHour, StandardMinute, StandardSecond, StandardMilliseconds, StandardWeekday) {
    var TimeZoneBias;
    var NewTimeZoneBias;
    var LocalCustomBias;
    var StandardTime;
    var DaylightTime;
    var ComputedUniversalTime;
    var bDaylightTimeZone;
    NewTimeZoneBias = Bias;
    if ((!!StandardMonth) && (!!DaylightMonth)) {
        StandardTime = SparkleXrm.Sdk.DateTimeEx._getCutoverTime(LocalTime, StandardYear, StandardMonth, StandardDay, StandardHour, StandardMinute, StandardSecond, StandardMilliseconds, StandardWeekday);
        if (StandardTime == null) {
            return null;
        }
        DaylightTime = SparkleXrm.Sdk.DateTimeEx._getCutoverTime(LocalTime, DaylightYear, DaylightMonth, DaylightDay, DaylightHour, DaylightMinute, DaylightSecond, DaylightMilliseconds, DaylightWeekday);
        if (DaylightTime == null) {
            return null;
        }
        if (DaylightTime < StandardTime) {
            if ((LocalTime >= DaylightTime) && (LocalTime < StandardTime)) {
                bDaylightTimeZone = true;
            }
            else {
                bDaylightTimeZone = false;
            }
        }
        else {
            if ((LocalTime >= StandardTime) && (LocalTime < DaylightTime)) {
                bDaylightTimeZone = false;
            }
            else {
                bDaylightTimeZone = true;
            }
        }
        if (bDaylightTimeZone) {
            LocalCustomBias = DaylightBias;
        }
        else {
            LocalCustomBias = StandardBias;
        }
        TimeZoneBias = NewTimeZoneBias + LocalCustomBias;
    }
    else {
        TimeZoneBias = NewTimeZoneBias;
    }
    ComputedUniversalTime = SparkleXrm.Sdk.DateTimeEx.dateAdd('minutes', TimeZoneBias, LocalTime);
    return ComputedUniversalTime;
}
SparkleXrm.Sdk.DateTimeEx.utcToLocalTimeFromSettings = function SparkleXrm_Sdk_DateTimeEx$utcToLocalTimeFromSettings(UTCTime, settings) {
    return SparkleXrm.Sdk.DateTimeEx.utcToLocalTime(UTCTime, settings.timezonebias, settings.timezonedaylightbias, settings.timezonedaylightyear, settings.timezonedaylightmonth, settings.timezonedaylightday, settings.timezonedaylighthour, settings.timezonedaylightminute, settings.timezonedaylightsecond, 0, settings.timezonedaylightdayofweek, settings.timezonestandardbias, settings.timezonestandardyear, settings.timezonestandardmonth, settings.timezonestandardday, settings.timezonestandardhour, settings.timezonestandardminute, settings.timezonestandardsecond, 0, settings.timezonestandarddayofweek);
}
SparkleXrm.Sdk.DateTimeEx.utcToLocalTime = function SparkleXrm_Sdk_DateTimeEx$utcToLocalTime(UTCTime, Bias, DaylightBias, DaylightYear, DaylightMonth, DaylightDay, DaylightHour, DaylightMinute, DaylightSecond, DaylightMilliseconds, DaylightWeekday, StandardBias, StandardYear, StandardMonth, StandardDay, StandardHour, StandardMinute, StandardSecond, StandardMilliseconds, StandardWeekday) {
    var TimeZoneBias = 0;
    var NewTimeZoneBias = 0;
    var LocalCustomBias = 0;
    var StandardTime;
    var DaylightTime;
    var UtcStandardTime;
    var UtcDaylightTime;
    var ComputedLocalTime;
    var bDaylightTimeZone;
    NewTimeZoneBias = Bias;
    if ((!!StandardMonth) && (!!DaylightMonth)) {
        StandardTime = SparkleXrm.Sdk.DateTimeEx._getCutoverTime(UTCTime, StandardYear, StandardMonth, StandardDay, StandardHour, StandardMinute, StandardSecond, StandardMilliseconds, StandardWeekday);
        if (StandardTime == null) {
            return null;
        }
        DaylightTime = SparkleXrm.Sdk.DateTimeEx._getCutoverTime(UTCTime, DaylightYear, DaylightMonth, DaylightDay, DaylightHour, DaylightMinute, DaylightSecond, DaylightMilliseconds, DaylightWeekday);
        if (DaylightTime == null) {
            return null;
        }
        LocalCustomBias = StandardBias;
        TimeZoneBias = NewTimeZoneBias + LocalCustomBias;
        UtcDaylightTime = SparkleXrm.Sdk.DateTimeEx.dateAdd('minutes', TimeZoneBias, DaylightTime);
        LocalCustomBias = DaylightBias;
        TimeZoneBias = NewTimeZoneBias + LocalCustomBias;
        UtcStandardTime = SparkleXrm.Sdk.DateTimeEx.dateAdd('minutes', TimeZoneBias, StandardTime);
        if (UtcDaylightTime < UtcStandardTime) {
            if ((UTCTime >= UtcDaylightTime) && (UTCTime < UtcStandardTime)) {
                bDaylightTimeZone = true;
            }
            else {
                bDaylightTimeZone = false;
            }
        }
        else {
            if ((UTCTime >= UtcStandardTime) && (UTCTime < UtcDaylightTime)) {
                bDaylightTimeZone = false;
            }
            else {
                bDaylightTimeZone = true;
            }
        }
        if (bDaylightTimeZone) {
            LocalCustomBias = DaylightBias;
        }
        else {
            LocalCustomBias = StandardBias;
        }
        TimeZoneBias = NewTimeZoneBias + LocalCustomBias;
    }
    else {
        TimeZoneBias = NewTimeZoneBias;
    }
    ComputedLocalTime = SparkleXrm.Sdk.DateTimeEx.dateAdd('minutes', TimeZoneBias * -1, UTCTime);
    return ComputedLocalTime;
}
SparkleXrm.Sdk.DateTimeEx._getCutoverTime = function SparkleXrm_Sdk_DateTimeEx$_getCutoverTime(CurrentTime, Year, Month, Day, Hour, Minute, Second, Milliseconds, Weekday) {
    if (!!Year) {
        return null;
    }
    var WorkingTime;
    var ScratchTime;
    var BestWeekdayDate;
    var WorkingWeekdayNumber;
    var TargetWeekdayNumber;
    var TargetYear;
    var TargetMonth;
    var TargetWeekday;
    TargetWeekdayNumber = Day;
    if ((TargetWeekdayNumber > 5) || (!TargetWeekdayNumber)) {
        return null;
    }
    TargetWeekday = Weekday;
    TargetMonth = Month;
    TargetYear = CurrentTime.getFullYear();
    BestWeekdayDate = 0;
    WorkingTime = SparkleXrm.Sdk.DateTimeEx.firstDayOfMonth(CurrentTime, TargetMonth);
    WorkingTime = SparkleXrm.Sdk.DateTimeEx.dateAdd('hours', Hour, WorkingTime);
    WorkingTime = SparkleXrm.Sdk.DateTimeEx.dateAdd('minutes', Minute, WorkingTime);
    WorkingTime = SparkleXrm.Sdk.DateTimeEx.dateAdd('seconds', Second, WorkingTime);
    WorkingTime = SparkleXrm.Sdk.DateTimeEx.dateAdd('milliseconds', Milliseconds, WorkingTime);
    ScratchTime = WorkingTime;
    if (ScratchTime.getDay() > TargetWeekday) {
        WorkingTime = SparkleXrm.Sdk.DateTimeEx.dateAdd('days', (7 - (ScratchTime.getDay() - TargetWeekday)), WorkingTime);
    }
    else if (ScratchTime.getDay() < TargetWeekday) {
        WorkingTime = SparkleXrm.Sdk.DateTimeEx.dateAdd('days', (TargetWeekday - ScratchTime.getDay()), WorkingTime);
    }
    BestWeekdayDate = WorkingTime.getDay();
    WorkingWeekdayNumber = 1;
    ScratchTime = WorkingTime;
    while (WorkingWeekdayNumber < TargetWeekdayNumber) {
        WorkingTime = SparkleXrm.Sdk.DateTimeEx.dateAdd('days', 7, WorkingTime);
        if (WorkingTime.getMonth() !== ScratchTime.getMonth()) {
            break;
        }
        ScratchTime = WorkingTime;
        WorkingWeekdayNumber = WorkingWeekdayNumber + 1;
    }
    return ScratchTime;
}
SparkleXrm.Sdk.DateTimeEx.firstDayOfMonth = function SparkleXrm_Sdk_DateTimeEx$firstDayOfMonth(date, Month) {
    var startOfMonth = new Date(date.getTime());
    startOfMonth.setMonth(Month - 1);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0);
    startOfMonth.setMinutes(0);
    startOfMonth.setSeconds(0);
    startOfMonth.setMilliseconds(0);
    return startOfMonth;
}
SparkleXrm.Sdk.DateTimeEx.dateAdd = function SparkleXrm_Sdk_DateTimeEx$dateAdd(interval, value, date) {
    var ms = date.getTime();
    var result;
    switch (interval) {
        case 'milliseconds':
            result = new Date(ms + value);
            break;
        case 'seconds':
            result = new Date(ms + (value * 1000));
            break;
        case 'minutes':
            result = new Date(ms + (value * 1000 * 60));
            break;
        case 'hours':
            result = new Date(ms + (value * 1000 * 60 * 60));
            break;
        case 'days':
            result = new Date(ms + (value * 1000 * 60 * 60 * 24));
            break;
        default:
            result = date;
            break;
    }
    return result;
}
SparkleXrm.Sdk.DateTimeEx.firstDayOfWeek = function SparkleXrm_Sdk_DateTimeEx$firstDayOfWeek(date) {
    var weekStartOffset = 0;
    if (SparkleXrm.Sdk.OrganizationServiceProxy.organizationSettings != null) {
        weekStartOffset = SparkleXrm.Sdk.OrganizationServiceProxy.organizationSettings.weekstartdaycode.value;
    }
    var startOfWeek = new Date(date.getTime());
    var dayOfWeek = startOfWeek.getDay();
    dayOfWeek = dayOfWeek - weekStartOffset;
    if (dayOfWeek < 0) {
        dayOfWeek = 7 + dayOfWeek;
    }
    if (dayOfWeek > 0) {
        startOfWeek = SparkleXrm.Sdk.DateTimeEx.dateAdd('days', (dayOfWeek * -1), startOfWeek);
    }
    startOfWeek.setHours(0);
    startOfWeek.setMinutes(0);
    startOfWeek.setSeconds(0);
    startOfWeek.setMilliseconds(0);
    return startOfWeek;
}
SparkleXrm.Sdk.DateTimeEx.lastDayOfWeek = function SparkleXrm_Sdk_DateTimeEx$lastDayOfWeek(date) {
    var weekStartOffset = 0;
    if (SparkleXrm.Sdk.OrganizationServiceProxy.organizationSettings != null) {
        weekStartOffset = SparkleXrm.Sdk.OrganizationServiceProxy.organizationSettings.weekstartdaycode.value;
    }
    var endOfWeek = new Date(date.getTime());
    var dayOfWeek = endOfWeek.getDay();
    dayOfWeek = dayOfWeek - weekStartOffset;
    if (dayOfWeek < 0) {
        dayOfWeek = 7 + dayOfWeek;
    }
    endOfWeek = SparkleXrm.Sdk.DateTimeEx.dateAdd('days', (6 - dayOfWeek), endOfWeek);
    endOfWeek.setHours(23);
    endOfWeek.setMinutes(59);
    endOfWeek.setSeconds(59);
    endOfWeek.setMilliseconds(999);
    return endOfWeek;
}
SparkleXrm.Sdk.DateTimeEx.formatTimeSpecific = function SparkleXrm_Sdk_DateTimeEx$formatTimeSpecific(dateValue, formatString) {
    formatString = formatString.replaceAll('.', ':').replaceAll('-', ':').replaceAll(',', ':');
    if (dateValue != null && (Date === Type.getInstanceType(dateValue))) {
        return dateValue.format(formatString);
    }
    else {
        return '';
    }
}
SparkleXrm.Sdk.DateTimeEx.formatDateSpecific = function SparkleXrm_Sdk_DateTimeEx$formatDateSpecific(dateValue, formatString) {
    if (dateValue != null) {
        return xrmjQuery.datepicker.formatDate( formatString, dateValue );
    }
    else {
        return '';
    }
}
SparkleXrm.Sdk.DateTimeEx.parseDateSpecific = function SparkleXrm_Sdk_DateTimeEx$parseDateSpecific(dateValue, formatString) {
    return xrmjQuery.datepicker.parseDate( formatString, dateValue );
}
SparkleXrm.Sdk.DateTimeEx.setTime = function SparkleXrm_Sdk_DateTimeEx$setTime(date, time) {
    if (date != null && time != null) {
        date.setHours(time.getHours());
        date.setMinutes(time.getMinutes());
        date.setSeconds(time.getSeconds());
        date.setMilliseconds(time.getMilliseconds());
    }
}
SparkleXrm.Sdk.DateTimeEx.setUTCTime = function SparkleXrm_Sdk_DateTimeEx$setUTCTime(date, time) {
    if (date != null && time != null) {
        date.setUTCHours(time.getUTCHours());
        date.setUTCMinutes(time.getUTCMinutes());
        date.setUTCSeconds(time.getUTCSeconds());
        date.setUTCMilliseconds(time.getUTCMilliseconds());
    }
}
SparkleXrm.Sdk.DateTimeEx.getTimeDuration = function SparkleXrm_Sdk_DateTimeEx$getTimeDuration(date) {
    return (date.getHours() * (60 * 60)) + (date.getMinutes() * 60) + date.getSeconds();
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Entity

SparkleXrm.Sdk.Entity = function SparkleXrm_Sdk_Entity(entityName) {
    this._metaData = {};
    this.logicalName = entityName;
    this._attributes = {};
    this.formattedValues = {};
}
SparkleXrm.Sdk.Entity.setAttributeValueEntity = function SparkleXrm_Sdk_Entity$setAttributeValueEntity(entity, name, value) {
    if (entity._attributes != null) {
        entity._attributes[name] = value;
    }
    entity[name] = value;
}
SparkleXrm.Sdk.Entity.sortDelegate = function SparkleXrm_Sdk_Entity$sortDelegate(attributeName, a, b) {
    var l = a.getAttributeValue(attributeName);
    var r = b.getAttributeValue(attributeName);
    var result = 0;
    var typeName = '';
    if (l != null) {
        typeName = Type.getInstanceType(l).get_name();
    }
    else if (r != null) {
        typeName = Type.getInstanceType(r).get_name();
    }
    if (l !== r) {
        switch (typeName.toLowerCase()) {
            case 'string':
                l = (l != null) ? (l).toLowerCase() : null;
                r = (r != null) ? (r).toLowerCase() : null;
                if (l<r) {
                    result = -1;
                }
                else {
                    result = 1;
                }
                break;
            case 'date':
                if (l == null) {
                    result = -1;
                }
                else if (r == null) {
                    result = 1;
                }
                else if (l<r) {
                    result = -1;
                }
                else {
                    result = 1;
                }
                break;
            case 'number':
                var ln = (l != null) ? (l) : 0;
                var rn = (r != null) ? (r) : 0;
                result = (ln - rn);
                break;
            case 'money':
                var lm = (l != null) ? (l).value : 0;
                var rm = (r != null) ? (r).value : 0;
                result = (lm - rm);
                break;
            case 'optionsetvalue':
                var lo = (l != null) ? (l).value : 0;
                lo = (lo != null) ? lo : 0;
                var ro = (r != null) ? (r).value : 0;
                ro = (ro != null) ? ro : 0;
                result = (lo - ro);
                break;
            case 'entityreference':
                var le = ((l != null) && ((l).name != null)) ? (l).name : '';
                var re = (r != null && ((r).name != null)) ? (r).name : '';
                if (le<re) {
                    result = -1;
                }
                else {
                    result = 1;
                }
                break;
        }
    }
    return result;
}
SparkleXrm.Sdk.Entity._serialiseWebApi = function SparkleXrm_Sdk_Entity$_serialiseWebApi(entity, completeCallback, errorCallback, async) {
    SparkleXrm.Sdk.WebApiOrganizationServiceProxy.addNavigationPropertyMetadata(entity.logicalName, 'transactioncurrencyid', 'transactioncurrency');
    SparkleXrm.Sdk.WebApiOrganizationServiceProxy.addNavigationPropertyMetadata(entity.logicalName, 'ownerid', 'systemuser,team');
    SparkleXrm.Sdk.WebApiOrganizationServiceProxy.addNavigationPropertyMetadata(entity.logicalName, 'createdby', 'systemuser');
    SparkleXrm.Sdk.WebApiOrganizationServiceProxy.addNavigationPropertyMetadata(entity.logicalName, 'modifiedby', 'systemuser');
    SparkleXrm.Sdk.WebApiOrganizationServiceProxy.addNavigationPropertyMetadata(entity.logicalName, 'customerid', 'account,contact');
    var jsonObject = {};
    var lookupsToResolve = [];
    var lookupAttributes = {};
    var attributeToOdataName = {};
    var attributeToType = {};
    var activityparties = [];
    jsonObject['@odata.type'] = 'Microsoft.Dynamics.CRM.' + entity.logicalName;
    var $enum1 = ss.IEnumerator.getEnumerator(Object.keys((entity)));
    while ($enum1.moveNext()) {
        var attribute = $enum1.current;
        if (SparkleXrm.Sdk.Entity._isEntityAttribute(entity, attribute)) {
            var attributeType = Type.getInstanceType(entity.getAttributeValue(attribute));
            var odataAttributeName = attribute;
            var key = entity.logicalName + '.' + attribute;
            var value = entity.getAttributeValue(attribute);
            var entityRef = value;
            if (attributeType === SparkleXrm.Sdk.EntityReference && value != null && attribute === 'partyid') {
                odataAttributeName += '_' + entityRef.logicalName;
            }
            else if (Object.keyExists(SparkleXrm.Sdk.WebApiOrganizationServiceProxy._logicalNameToNavigationMapping, key)) {
                attributeType = SparkleXrm.Sdk.EntityReference;
                if (SparkleXrm.Sdk.WebApiOrganizationServiceProxy._logicalNameToNavigationMapping[key].length > 1 && (value == null)) {
                    var $enum2 = ss.IEnumerator.getEnumerator(SparkleXrm.Sdk.WebApiOrganizationServiceProxy._logicalNameToNavigationMapping[key]);
                    while ($enum2.moveNext()) {
                        var type = $enum2.current;
                        jsonObject[odataAttributeName + '_' + type + '@odata.bind'] = null;
                    }
                    odataAttributeName = null;
                    attributeType = null;
                }
                else if (SparkleXrm.Sdk.WebApiOrganizationServiceProxy._logicalNameToNavigationMapping[key].length > 1 && (value != null)) {
                    var $enum3 = ss.IEnumerator.getEnumerator(SparkleXrm.Sdk.WebApiOrganizationServiceProxy._logicalNameToNavigationMapping[key]);
                    while ($enum3.moveNext()) {
                        var type = $enum3.current;
                        if (type === entityRef.logicalName) {
                            odataAttributeName += '_' + type;
                            break;
                        }
                    }
                }
            }
            if (odataAttributeName != null) {
                attributeToOdataName[attribute] = odataAttributeName;
                attributeToType[attribute] = attributeType;
            }
            if (attributeType === SparkleXrm.Sdk.EntityReference) {
                if (value != null) {
                    lookupsToResolve.add(entity.getAttributeValueEntityReference(attribute));
                }
                lookupAttributes[attribute] = odataAttributeName;
            }
        }
    }
    SparkleXrm.Sdk.WebApiOrganizationServiceProxy.mapLookupsToEntitySets(lookupsToResolve, function() {
        SparkleXrm.DelegateItterator.callbackItterate(function(index, nextCallBack, errorCallBack) {
            var attributeLogicalName = Object.keys(attributeToOdataName)[index];
            var attributeValue = entity.getAttributeValue(attributeLogicalName);
            var attributeType = attributeToType[attributeLogicalName];
            SparkleXrm.Sdk.Attribute._serialiseWebApiAttribute(attributeType, attributeValue, function(value) {
                var fieldname = attributeToOdataName[attributeLogicalName];
                if (attributeType === SparkleXrm.Sdk.EntityReference) {
                    if (fieldname === 'record1id' || fieldname === 'record2id') {
                        if (value != null && ('logicalName' in value)) {
                            var navProp = value.logicalName;
                            fieldname = fieldname + '_' + navProp;
                        }
                    }
                    fieldname = fieldname + '@odata.bind';
                    if (value != null && ('@odata.id' in value)) {
                        value = value['@odata.id'];
                    }
                }
                if (attributeType === SparkleXrm.Sdk.EntityCollection && ((value).length > 0) && (value)[0]['@odata.type'] === 'Microsoft.Dynamics.CRM.activityparty') {
                    var participationType = 2;
                    switch (fieldname) {
                        case 'to':
                            participationType = 2;
                            break;
                        case 'from':
                            participationType = 1;
                            break;
                        case 'bcc':
                            participationType = 4;
                            break;
                    }
                    var $enum1 = ss.IEnumerator.getEnumerator((value));
                    while ($enum1.moveNext()) {
                        var party = $enum1.current;
                        party.participationtypemask = participationType;
                        activityparties.add(party);
                    }
                }
                else {
                    jsonObject[fieldname] = value;
                }
                nextCallBack();
            }, errorCallback, async);
        }, Object.getKeyCount(attributeToOdataName), function() {
            if (activityparties.length > 0) {
                jsonObject[entity.logicalName + '_activity_parties'] = activityparties;
            }
            completeCallback(jsonObject);
        }, function(ex) {
            errorCallback(ex);
        });
    }, errorCallback, async);
}
SparkleXrm.Sdk.Entity._isEntityAttribute = function SparkleXrm_Sdk_Entity$_isEntityAttribute(record, key) {
    return (typeof(record[key])!="function" && Object.prototype.hasOwnProperty.call(record, key) && !SparkleXrm.StringEx.IN(key, [ 'id', 'logicalName', 'entityState', 'formattedValues', 'relatedEntities' ]) && !key.startsWith('$') && !key.startsWith('_'));
}
SparkleXrm.Sdk.Entity.deSerialiseWebApiStatic = function SparkleXrm_Sdk_Entity$deSerialiseWebApiStatic(entity, pojoEntity) {
    if (String.isNullOrEmpty(entity.logicalName)) {
        if (Object.keyExists(pojoEntity, '@odata.type')) {
            entity.logicalName = (pojoEntity['@odata.type']).substr('#Microsoft.Dynamics.CRM.'.length);
        }
        else {
            throw new Error('Logical name not set');
        }
    }
    var metadata = SparkleXrm.Sdk.WebApiOrganizationServiceProxy._webApiMetadata[entity.logicalName];
    entity.id = pojoEntity[metadata.primaryAttributeLogicalName];
    var $enum1 = ss.IEnumerator.getEnumerator(Object.keys(pojoEntity));
    while ($enum1.moveNext()) {
        var key = $enum1.current;
        var posAt = key.indexOf('@');
        var containsAt = posAt > -1;
        var navigationProperty = key.endsWith('@Microsoft.Dynamics.CRM.associatednavigationproperty');
        var underscore = key.startsWith('_');
        if ((!containsAt && !underscore) || navigationProperty) {
            var attributeValue = null;
            var attributeType = null;
            var attributeLogicalName = key;
            var navigationPropertyLogicalName = null;
            var attributeNameWithoutAt = key.substr(0, posAt);
            if (navigationProperty) {
                navigationPropertyLogicalName = pojoEntity[key];
                attributeLogicalName = attributeNameWithoutAt;
            }
            var navigationPropertyName = attributeNameWithoutAt + '@Microsoft.Dynamics.CRM.associatednavigationproperty';
            var lookupLogicalName = attributeNameWithoutAt + '@Microsoft.Dynamics.CRM.lookuplogicalname';
            var baseLogicalName = attributeLogicalName + '_base';
            var formattedValueName = attributeLogicalName + '@OData.Community.Display.V1.FormattedValue';
            if (attributeLogicalName.endsWith('_activity_parties')) {
                attributeType = 'EntityCollection';
            }
            else if (navigationProperty && Object.keyExists(pojoEntity, lookupLogicalName)) {
                attributeType = 'EntityReference';
            }
            else if (Object.keyExists(pojoEntity, baseLogicalName)) {
                attributeType = 'Money';
            }
            else if (Object.keyExists(pojoEntity, formattedValueName) && Type.getInstanceType(pojoEntity[attributeLogicalName]) === Number) {
                attributeType = 'OptionSetValue';
            }
            else if (entity._metaData != null && Object.keyExists(entity._metaData, attributeLogicalName)) {
                attributeType = entity._metaData[attributeLogicalName];
            }
            switch (attributeType) {
                case 'EntityReference':
                    var entityType = pojoEntity[lookupLogicalName];
                    attributeValue = new SparkleXrm.Sdk.EntityReference(new SparkleXrm.Sdk.Guid(pojoEntity[attributeLogicalName]), entityType, pojoEntity[formattedValueName]);
                    var lookupAttributeName = pojoEntity[navigationPropertyName];
                    if (lookupAttributeName.endsWith('_' + entityType)) {
                        var typePos = lookupAttributeName.lastIndexOf('_' + entityType);
                        attributeLogicalName = lookupAttributeName.substr(0, typePos);
                    }
                    else {
                        attributeLogicalName = lookupAttributeName;
                    }
                    break;
                case 'Money':
                    attributeValue = new SparkleXrm.Sdk.Money(pojoEntity[attributeLogicalName]);
                    break;
                case 'OptionSetValue':
                    var optionSetValue = new SparkleXrm.Sdk.OptionSetValue(pojoEntity[attributeLogicalName]);
                    optionSetValue.name = pojoEntity[formattedValueName];
                    attributeValue = optionSetValue;
                    break;
                case 'EntityCollection':
                    var results = {};
                    results['value'] = pojoEntity[attributeLogicalName];
                    attributeValue = SparkleXrm.Sdk.EntityCollection.deserialiseWebApi(SparkleXrm.Sdk.Entity, 'activityparty', results);
                    break;
                default:
                    attributeValue = pojoEntity[attributeLogicalName];
                    break;
            }
            if (attributeLogicalName.endsWith('_activity_parties')) {
                var partyAttributes = {};
                var $enum2 = ss.IEnumerator.getEnumerator((attributeValue).entities);
                while ($enum2.moveNext()) {
                    var party = $enum2.current;
                    var partyLogicalName = SparkleXrm.Sdk.WebApiOrganizationServiceProxy._partyListAttributes[party.getAttributeValueOptionSet('participationtypemask').value];
                    if (!Object.keyExists(partyAttributes, partyLogicalName)) {
                        partyAttributes[partyLogicalName] = [];
                    }
                    partyAttributes[partyLogicalName].add(party);
                }
                var $enum3 = ss.IEnumerator.getEnumerator(Object.keys(partyAttributes));
                while ($enum3.moveNext()) {
                    var partyLogicalName = $enum3.current;
                    SparkleXrm.Sdk.Entity.setAttributeValueEntity(entity, partyLogicalName, new SparkleXrm.Sdk.EntityCollection(partyAttributes[partyLogicalName]));
                }
            }
            else {
                SparkleXrm.Sdk.Entity.setAttributeValueEntity(entity, attributeLogicalName, attributeValue);
            }
        }
    }
}
SparkleXrm.Sdk.Entity.prototype = {
    _entitySetName: null,
    logicalName: null,
    id: null,
    entityState: 0,
    _attributes: null,
    formattedValues: null,
    relatedEntities: null,
    
    deSerialise: function SparkleXrm_Sdk_Entity$deSerialise(entityNode) {
        this.logicalName = SparkleXrm.Sdk.XmlHelper.selectSingleNodeValue(entityNode, 'LogicalName');
        this.id = SparkleXrm.Sdk.XmlHelper.selectSingleNodeValue(entityNode, 'Id');
        var attributes = SparkleXrm.Sdk.XmlHelper.selectSingleNode(entityNode, 'Attributes');
        var attributeCount = attributes.childNodes.length;
        for (var i = 0; i < attributeCount; i++) {
            var node = attributes.childNodes[i];
            try {
                var attributeName = SparkleXrm.Sdk.XmlHelper.selectSingleNodeValue(node, 'key');
                var attributeValue = SparkleXrm.Sdk.Attribute.deSerialise(SparkleXrm.Sdk.XmlHelper.selectSingleNode(node, 'value'), null);
                this._attributes[attributeName] = attributeValue;
                this[attributeName] = attributeValue;
            }
            catch (e) {
                throw new Error('Invalid Attribute Value :' + SparkleXrm.Sdk.XmlHelper.getNodeTextValue(node) + ':' + e.message);
            }
        }
        var formattedValues = SparkleXrm.Sdk.XmlHelper.selectSingleNode(entityNode, 'FormattedValues');
        if (formattedValues != null) {
            for (var i = 0; i < formattedValues.childNodes.length; i++) {
                var node = formattedValues.childNodes[i];
                var key = SparkleXrm.Sdk.XmlHelper.selectSingleNodeValue(node, 'key');
                var value = SparkleXrm.Sdk.XmlHelper.selectSingleNodeValue(node, 'value');
                this[key + 'name'] = value;
                this.formattedValues[key + 'name'] = value;
                var att = this._attributes[key];
                if (att != null) {
                    att.name=value;
                }
            }
        }
        var relatedEntities = SparkleXrm.Sdk.XmlHelper.selectSingleNode(entityNode, 'RelatedEntities');
        if (relatedEntities != null) {
            var relatedEntitiesColection = {};
            for (var i = 0; i < relatedEntities.childNodes.length; i++) {
                var node = relatedEntities.childNodes[i];
                var key = SparkleXrm.Sdk.XmlHelper.selectSingleNode(node, 'key');
                var schemaName = SparkleXrm.Sdk.XmlHelper.selectSingleNodeValue(key, 'SchemaName');
                var relationship = new SparkleXrm.Sdk.Relationship(schemaName);
                var value = SparkleXrm.Sdk.XmlHelper.selectSingleNode(node, 'value');
                var entities = SparkleXrm.Sdk.EntityCollection.deSerialise(value);
                relatedEntitiesColection[relationship.schemaName] = entities;
            }
            this.relatedEntities = relatedEntitiesColection;
        }
    },
    
    serialise: function SparkleXrm_Sdk_Entity$serialise(ommitRoot) {
        var xml = '';
        if (ommitRoot == null || !ommitRoot) {
            xml += '<a:Entity>';
        }
        xml += '<a:Attributes>';
        var record = (this);
        if (record[this.logicalName + 'id'] == null) {
            delete record[this.logicalName + 'id'];
        }
        var $enum1 = ss.IEnumerator.getEnumerator(Object.keys(record));
        while ($enum1.moveNext()) {
            var key = $enum1.current;
            if (typeof(record[key])!="function" && Object.prototype.hasOwnProperty.call(this, key) && !SparkleXrm.StringEx.IN(key, [ 'id', 'logicalName', 'entityState', 'formattedValues', 'relatedEntities' ]) && !key.startsWith('$') && !key.startsWith('_')) {
                var attributeValue = record[key];
                if (!Object.keyExists(this.formattedValues, key)) {
                    xml += SparkleXrm.Sdk.Attribute.serialise(key, attributeValue, this._metaData);
                }
            }
        }
        xml += '</a:Attributes>';
        xml += '<a:LogicalName>' + this.logicalName + '</a:LogicalName>';
        if (this.id != null) {
            xml += '<a:Id>' + this.id + '</a:Id>';
        }
        if (ommitRoot == null || !ommitRoot) {
            xml += '</a:Entity>';
        }
        return xml;
    },
    
    setAttributeValue: function SparkleXrm_Sdk_Entity$setAttributeValue(name, value) {
        SparkleXrm.Sdk.Entity.setAttributeValueEntity(this, name, value);
    },
    
    getAttributeValue: function SparkleXrm_Sdk_Entity$getAttributeValue(attributeName) {
        return this[attributeName];
    },
    
    getAttributeValueOptionSet: function SparkleXrm_Sdk_Entity$getAttributeValueOptionSet(attributeName) {
        return this.getAttributeValue(attributeName);
    },
    
    getAttributeValueGuid: function SparkleXrm_Sdk_Entity$getAttributeValueGuid(attributeName) {
        return this.getAttributeValue(attributeName);
    },
    
    getAttributeValueInt: function SparkleXrm_Sdk_Entity$getAttributeValueInt(attributeName) {
        return this.getAttributeValue(attributeName);
    },
    
    getAttributeValueFloat: function SparkleXrm_Sdk_Entity$getAttributeValueFloat(attributeName) {
        return this.getAttributeValue(attributeName);
    },
    
    getAttributeValueString: function SparkleXrm_Sdk_Entity$getAttributeValueString(attributeName) {
        return this.getAttributeValue(attributeName);
    },
    
    getAttributeValueEntityReference: function SparkleXrm_Sdk_Entity$getAttributeValueEntityReference(attributeName) {
        return this.getAttributeValue(attributeName);
    },
    
    raisePropertyChanged: function SparkleXrm_Sdk_Entity$raisePropertyChanged(propertyName) {
        var args = {};
        args.propertyName = propertyName;
        if (this.__propertyChanged != null) {
            this.__propertyChanged(this, args);
        }
        if (propertyName !== 'EntityState' && !this.entityState && this.entityState !== 1) {
            this.entityState = 2;
        }
    },
    
    toEntityReference: function SparkleXrm_Sdk_Entity$toEntityReference() {
        return new SparkleXrm.Sdk.EntityReference(new SparkleXrm.Sdk.Guid(this.id), this.logicalName, '');
    },
    
    add_propertyChanged: function SparkleXrm_Sdk_Entity$add_propertyChanged(value) {
        this.__propertyChanged = ss.Delegate.combine(this.__propertyChanged, value);
    },
    remove_propertyChanged: function SparkleXrm_Sdk_Entity$remove_propertyChanged(value) {
        this.__propertyChanged = ss.Delegate.remove(this.__propertyChanged, value);
    },
    
    __propertyChanged: null,
    
    deSerialiseWebApi: function SparkleXrm_Sdk_Entity$deSerialiseWebApi(pojoEntity) {
        SparkleXrm.Sdk.Entity.deSerialiseWebApiStatic(this, pojoEntity);
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.EntityCollection

SparkleXrm.Sdk.EntityCollection = function SparkleXrm_Sdk_EntityCollection(entities) {
    this.entities = new SparkleXrm.Sdk.DataCollectionOfEntity(entities);
}
SparkleXrm.Sdk.EntityCollection.serialise = function SparkleXrm_Sdk_EntityCollection$serialise(value) {
    var valueXml = '';
    if (Type.getInstanceType(value) !== SparkleXrm.Sdk.EntityCollection) {
        throw new Error("An attribute value of type 'EntityCollection' must contain an EntityCollection instance");
    }
    var arrayValue = Type.safeCast(value, SparkleXrm.Sdk.EntityCollection);
    valueXml += '<a:Entities>';
    for (var i = 0; i < arrayValue.entities.get_count(); i++) {
        valueXml += (arrayValue.get_item(i)).serialise(false);
    }
    valueXml += '</a:Entities>';
    return valueXml;
}
SparkleXrm.Sdk.EntityCollection.deSerialise = function SparkleXrm_Sdk_EntityCollection$deSerialise(node) {
    var entities = [];
    var collection = new SparkleXrm.Sdk.EntityCollection(entities);
    collection.entityName = SparkleXrm.Sdk.XmlHelper.selectSingleNodeValue(node, 'EntityName');
    var entitiesNode = SparkleXrm.Sdk.XmlHelper.selectSingleNodeDeep(node, 'Entities');
    var $enum1 = ss.IEnumerator.getEnumerator(entitiesNode.childNodes);
    while ($enum1.moveNext()) {
        var entityNode = $enum1.current;
        var entity = new SparkleXrm.Sdk.Entity(collection.entityName);
        entity.deSerialise(entityNode);
        SparkleXrm.ArrayEx.add(entities, entity);
    }
    return collection;
}
SparkleXrm.Sdk.EntityCollection.serialiseWebApi = function SparkleXrm_Sdk_EntityCollection$serialiseWebApi(collection, completeCallback, errorCallback, async) {
    var items = [];
    SparkleXrm.DelegateItterator.callbackItterate(function(index, nextCallBack, errorCallBack) {
        SparkleXrm.Sdk.Entity._serialiseWebApi(collection.entities.get_item(index), function(jobject) {
            items.add(jobject);
            nextCallBack();
        }, errorCallback, async);
    }, collection.entities.get_count(), function() {
        completeCallback(items);
    }, function(ex) {
        errorCallback(ex);
    });
}
SparkleXrm.Sdk.EntityCollection.deserialiseWebApi = function SparkleXrm_Sdk_EntityCollection$deserialiseWebApi(entityType, logicalName, results) {
    var entities = [];
    var $enum1 = ss.IEnumerator.getEnumerator(results['value']);
    while ($enum1.moveNext()) {
        var row = $enum1.current;
        var entity = new entityType(logicalName);
        entity.deSerialiseWebApi(row);
        entities.add(entity);
    }
    var collection = new SparkleXrm.Sdk.EntityCollection(entities);
    if (results['@Microsoft.Dynamics.CRM.fetchxmlpagingcookie'] != null) {
        collection.pagingCookie = results['@Microsoft.Dynamics.CRM.fetchxmlpagingcookie'];
    }
    if (results['@Microsoft.Dynamics.CRM.fetchxmlpagingcookie'] != null) {
        collection.totalRecordCount = results['@Microsoft.Dynamics.CRM.totalrecordcount'];
    }
    return collection;
}
SparkleXrm.Sdk.EntityCollection.prototype = {
    entities: null,
    entityName: null,
    minActiveRowVersion: null,
    moreRecords: false,
    pagingCookie: null,
    totalRecordCount: 0,
    totalRecordCountLimitExceeded: false,
    get_item: function SparkleXrm_Sdk_EntityCollection$get_item(index) {
        return this.entities.get_item(index);
    },
    set_item: function SparkleXrm_Sdk_EntityCollection$set_item(index, value) {
        this.entities.set_item(index, value);
        return value;
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.EntityReference

SparkleXrm.Sdk.EntityReference = function SparkleXrm_Sdk_EntityReference(Id, LogicalName, Name) {
    this.id = Id;
    this.logicalName = LogicalName;
    this.name = Name;
}
SparkleXrm.Sdk.EntityReference.prototype = {
    name: null,
    id: null,
    logicalName: null,
    
    toString: function SparkleXrm_Sdk_EntityReference$toString() {
        return String.format('[EntityReference: {0},{1},{2}]', this.name, this.id, this.logicalName);
    },
    
    toSoap: function SparkleXrm_Sdk_EntityReference$toSoap(NameSpace) {
        if (NameSpace == null || !NameSpace) {
            NameSpace = 'a';
        }
        return String.format('<{0}:EntityReference><{0}:Id>{1}</{0}:Id><{0}:LogicalName>{2}</{0}:LogicalName><{0}:Name i:nil="true" /></{0}:EntityReference>', NameSpace, this.id.value, this.logicalName);
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Guid

SparkleXrm.Sdk.Guid = function SparkleXrm_Sdk_Guid(Value) {
    this.value = Value;
}
SparkleXrm.Sdk.Guid.stripGuid = function SparkleXrm_Sdk_Guid$stripGuid(guid) {
    return guid.replaceAll('{', '').replaceAll('}', '');
}
SparkleXrm.Sdk.Guid.prototype = {
    value: null,
    
    toString: function SparkleXrm_Sdk_Guid$toString() {
        return this.value;
    },
    
    strip: function SparkleXrm_Sdk_Guid$strip() {
        return SparkleXrm.Sdk.Guid.stripGuid(this.value);
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Money

SparkleXrm.Sdk.Money = function SparkleXrm_Sdk_Money(value) {
    this.value = value;
}
SparkleXrm.Sdk.Money.prototype = {
    value: 0
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.OptionSetValue

SparkleXrm.Sdk.OptionSetValue = function SparkleXrm_Sdk_OptionSetValue(value) {
    this.value = value;
}
SparkleXrm.Sdk.OptionSetValue.parse = function SparkleXrm_Sdk_OptionSetValue$parse(value) {
    if (String.isNullOrEmpty(value)) {
        return new SparkleXrm.Sdk.OptionSetValue(null);
    }
    else {
        return new SparkleXrm.Sdk.OptionSetValue(parseInt(value));
    }
}
SparkleXrm.Sdk.OptionSetValue.prototype = {
    name: null,
    value: null
}



////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.OrganizationServiceProxy

SparkleXrm.Sdk.OrganizationServiceProxy = function SparkleXrm_Sdk_OrganizationServiceProxy() {
}
SparkleXrm.Sdk.OrganizationServiceProxy.setImplementation = function SparkleXrm_Sdk_OrganizationServiceProxy$setImplementation(type) {
    switch (type) {
        case 'soap2011':
            throw new Error('Not supported');
        case 'webApi':
            SparkleXrm.Sdk.OrganizationServiceProxy._service = new SparkleXrm.Sdk.WebApiOrganizationServiceProxy();
            break;
    }
}
SparkleXrm.Sdk.OrganizationServiceProxy.registerExecuteMessageResponseType = function SparkleXrm_Sdk_OrganizationServiceProxy$registerExecuteMessageResponseType(responseTypeName, organizationResponseType) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.registerExecuteMessageResponseType(responseTypeName, organizationResponseType);
}
SparkleXrm.Sdk.OrganizationServiceProxy.getUserSettings = function SparkleXrm_Sdk_OrganizationServiceProxy$getUserSettings() {
    return SparkleXrm.Sdk.OrganizationServiceProxy._service.getUserSettings();
}
SparkleXrm.Sdk.OrganizationServiceProxy.doesNNAssociationExist = function SparkleXrm_Sdk_OrganizationServiceProxy$doesNNAssociationExist(relationship, Entity1, Entity2) {
    return SparkleXrm.Sdk.OrganizationServiceProxy._service.doesNNAssociationExist(relationship, Entity1, Entity2);
}
SparkleXrm.Sdk.OrganizationServiceProxy.associate = function SparkleXrm_Sdk_OrganizationServiceProxy$associate(entityName, entityId, relationship, relatedEntities) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.associate(entityName, entityId, relationship, relatedEntities);
}
SparkleXrm.Sdk.OrganizationServiceProxy.beginAssociate = function SparkleXrm_Sdk_OrganizationServiceProxy$beginAssociate(entityName, entityId, relationship, relatedEntities, callBack) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.beginAssociate(entityName, entityId, relationship, relatedEntities, callBack);
}
SparkleXrm.Sdk.OrganizationServiceProxy.endAssociate = function SparkleXrm_Sdk_OrganizationServiceProxy$endAssociate(asyncState) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.endAssociate(asyncState);
}
SparkleXrm.Sdk.OrganizationServiceProxy.disassociate = function SparkleXrm_Sdk_OrganizationServiceProxy$disassociate(entityName, entityId, relationship, relatedEntities) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.disassociate(entityName, entityId, relationship, relatedEntities);
}
SparkleXrm.Sdk.OrganizationServiceProxy.beginDisassociate = function SparkleXrm_Sdk_OrganizationServiceProxy$beginDisassociate(entityName, entityId, relationship, relatedEntities, callBack) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.beginDisassociate(entityName, entityId, relationship, relatedEntities, callBack);
}
SparkleXrm.Sdk.OrganizationServiceProxy.endDisassociate = function SparkleXrm_Sdk_OrganizationServiceProxy$endDisassociate(asyncState) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.endDisassociate(asyncState);
}
SparkleXrm.Sdk.OrganizationServiceProxy.retrieveMultiple = function SparkleXrm_Sdk_OrganizationServiceProxy$retrieveMultiple(fetchXml) {
    return SparkleXrm.Sdk.OrganizationServiceProxy._service.retrieveMultiple(fetchXml);
}
SparkleXrm.Sdk.OrganizationServiceProxy.beginRetrieveMultiple = function SparkleXrm_Sdk_OrganizationServiceProxy$beginRetrieveMultiple(fetchXml, callBack) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.beginRetrieveMultiple(fetchXml, callBack);
}
SparkleXrm.Sdk.OrganizationServiceProxy.endRetrieveMultiple = function SparkleXrm_Sdk_OrganizationServiceProxy$endRetrieveMultiple(asyncState, entityType) {
    return SparkleXrm.Sdk.OrganizationServiceProxy._service.endRetrieveMultiple(asyncState, entityType);
}
SparkleXrm.Sdk.OrganizationServiceProxy.retrieve = function SparkleXrm_Sdk_OrganizationServiceProxy$retrieve(entityName, entityId, attributesList) {
    return SparkleXrm.Sdk.OrganizationServiceProxy._service.retrieve(entityName, entityId, attributesList);
}
SparkleXrm.Sdk.OrganizationServiceProxy.beginRetrieve = function SparkleXrm_Sdk_OrganizationServiceProxy$beginRetrieve(entityName, entityId, attributesList, callBack) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.beginRetrieve(entityName, entityId, attributesList, callBack);
}
SparkleXrm.Sdk.OrganizationServiceProxy.endRetrieve = function SparkleXrm_Sdk_OrganizationServiceProxy$endRetrieve(asyncState, entityType) {
    return SparkleXrm.Sdk.OrganizationServiceProxy._service.endRetrieve(asyncState, entityType);
}
SparkleXrm.Sdk.OrganizationServiceProxy.create = function SparkleXrm_Sdk_OrganizationServiceProxy$create(entity) {
    return SparkleXrm.Sdk.OrganizationServiceProxy._service.create(entity);
}
SparkleXrm.Sdk.OrganizationServiceProxy.beginCreate = function SparkleXrm_Sdk_OrganizationServiceProxy$beginCreate(entity, callBack) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.beginCreate(entity, callBack);
}
SparkleXrm.Sdk.OrganizationServiceProxy.endCreate = function SparkleXrm_Sdk_OrganizationServiceProxy$endCreate(asyncState) {
    return SparkleXrm.Sdk.OrganizationServiceProxy._service.endCreate(asyncState);
}
SparkleXrm.Sdk.OrganizationServiceProxy.setState = function SparkleXrm_Sdk_OrganizationServiceProxy$setState(id, entityName, stateCode, statusCode) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.setState(id, entityName, stateCode, statusCode);
}
SparkleXrm.Sdk.OrganizationServiceProxy.beginSetState = function SparkleXrm_Sdk_OrganizationServiceProxy$beginSetState(id, entityName, stateCode, statusCode, callBack) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.beginSetState(id, entityName, stateCode, statusCode, callBack);
}
SparkleXrm.Sdk.OrganizationServiceProxy.endSetState = function SparkleXrm_Sdk_OrganizationServiceProxy$endSetState(asyncState) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.endSetState(asyncState);
}
SparkleXrm.Sdk.OrganizationServiceProxy.delete_ = function SparkleXrm_Sdk_OrganizationServiceProxy$delete_(entityName, id) {
    return SparkleXrm.Sdk.OrganizationServiceProxy._service.delete_(entityName, id);
}
SparkleXrm.Sdk.OrganizationServiceProxy.beginDelete = function SparkleXrm_Sdk_OrganizationServiceProxy$beginDelete(entityName, id, callBack) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.beginDelete(entityName, id, callBack);
}
SparkleXrm.Sdk.OrganizationServiceProxy.endDelete = function SparkleXrm_Sdk_OrganizationServiceProxy$endDelete(asyncState) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.endDelete(asyncState);
}
SparkleXrm.Sdk.OrganizationServiceProxy.update = function SparkleXrm_Sdk_OrganizationServiceProxy$update(entity) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.update(entity);
}
SparkleXrm.Sdk.OrganizationServiceProxy.beginUpdate = function SparkleXrm_Sdk_OrganizationServiceProxy$beginUpdate(entity, callBack) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.beginUpdate(entity, callBack);
}
SparkleXrm.Sdk.OrganizationServiceProxy.endUpdate = function SparkleXrm_Sdk_OrganizationServiceProxy$endUpdate(asyncState) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.endUpdate(asyncState);
}
SparkleXrm.Sdk.OrganizationServiceProxy.execute = function SparkleXrm_Sdk_OrganizationServiceProxy$execute(request) {
    return SparkleXrm.Sdk.OrganizationServiceProxy._service.execute(request);
}
SparkleXrm.Sdk.OrganizationServiceProxy.beginExecute = function SparkleXrm_Sdk_OrganizationServiceProxy$beginExecute(request, callBack) {
    SparkleXrm.Sdk.OrganizationServiceProxy._service.beginExecute(request, callBack);
}
SparkleXrm.Sdk.OrganizationServiceProxy.endExecute = function SparkleXrm_Sdk_OrganizationServiceProxy$endExecute(asyncState) {
    return SparkleXrm.Sdk.OrganizationServiceProxy._service.endExecute(asyncState);
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.XrmService

SparkleXrm.Sdk.XrmService = function SparkleXrm_Sdk_XrmService() {
}
SparkleXrm.Sdk.XrmService.Create = function SparkleXrm_Sdk_XrmService$Create(contact) {
    return new Promise(function(resolve, reject) {
        SparkleXrm.Sdk.OrganizationServiceProxy.beginCreate(contact, function(state) {
            try {
                resolve(SparkleXrm.Sdk.OrganizationServiceProxy.endCreate(state));
            }
            catch (ex) {
                reject(ex);
            }
        });
    });
}
SparkleXrm.Sdk.XrmService.Retrieve = function SparkleXrm_Sdk_XrmService$Retrieve(entityName, id, columnSet) {
    var idString = id;
    if (Type.getInstanceType(id) === SparkleXrm.Sdk.Guid) {
        idString = (id).value;
    }
    return new Promise(function(resolve, reject) {
        var cols;
        if (columnSet.allColumns) {
            cols = [ 'AllColumns' ];
        }
        else {
            cols = columnSet.columns;
        }
        SparkleXrm.Sdk.OrganizationServiceProxy.beginRetrieve(entityName, idString, cols, function(state) {
            try {
                var response = SparkleXrm.Sdk.OrganizationServiceProxy.endRetrieve(state, SparkleXrm.Sdk.Entity);
                resolve(response);
            }
            catch (ex) {
                reject(ex);
            }
        });
    });
}
SparkleXrm.Sdk.XrmService.Update = function SparkleXrm_Sdk_XrmService$Update(contact) {
    return new Promise(function(resolve, reject) {
        SparkleXrm.Sdk.OrganizationServiceProxy.beginUpdate(contact, function(state) {
            try {
                SparkleXrm.Sdk.OrganizationServiceProxy.endUpdate(state);
                resolve(null);
            }
            catch (ex) {
                reject(ex);
            }
        });
    });
}
SparkleXrm.Sdk.XrmService.Delete = function SparkleXrm_Sdk_XrmService$Delete(entityName, id) {
    return new Promise(function(resolve, reject) {
        SparkleXrm.Sdk.OrganizationServiceProxy.beginDelete(entityName, id, function(state) {
            try {
                SparkleXrm.Sdk.OrganizationServiceProxy.endDelete(state);
                resolve(null);
            }
            catch (ex) {
                reject(ex);
            }
        });
    });
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Relationship

SparkleXrm.Sdk.Relationship = function SparkleXrm_Sdk_Relationship(schemaName) {
    this.schemaName = schemaName;
}
SparkleXrm.Sdk.Relationship.prototype = {
    primaryEntityRole: 0,
    schemaName: null
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.RetrieveRelationshipRequest

SparkleXrm.Sdk.RetrieveRelationshipRequest = function SparkleXrm_Sdk_RetrieveRelationshipRequest() {
    this.MetadataId = SparkleXrm.Sdk.Guid.empty;
}
SparkleXrm.Sdk.RetrieveRelationshipRequest.prototype = {
    Name: null,
    RetrieveAsIfPublished: false,
    
    serialise: function SparkleXrm_Sdk_RetrieveRelationshipRequest$serialise() {
        return '<request i:type="a:RetrieveRelationshipRequest" xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts">' + '<a:Parameters xmlns:b="http://schemas.datacontract.org/2004/07/System.Collections.Generic">' + '<a:KeyValuePairOfstringanyType>' + '<b:key>MetadataId</b:key>' + SparkleXrm.Sdk.Attribute.serialiseValue(this.MetadataId, null) + '</a:KeyValuePairOfstringanyType>' + '<a:KeyValuePairOfstringanyType>' + '<b:key>Name</b:key>' + SparkleXrm.Sdk.Attribute.serialiseValue(this.Name, null) + '</a:KeyValuePairOfstringanyType>' + '<a:KeyValuePairOfstringanyType>' + '<b:key>RetrieveAsIfPublished</b:key>' + SparkleXrm.Sdk.Attribute.serialiseValue(this.RetrieveAsIfPublished, null) + '</a:KeyValuePairOfstringanyType>' + '</a:Parameters>' + '<a:RequestId i:nil="true" />' + '<a:RequestName>RetrieveRelationship</a:RequestName>' + '</request>';
    },
    
    serialiseWebApi: function SparkleXrm_Sdk_RetrieveRelationshipRequest$serialiseWebApi() {
        var request = new SparkleXrm.Sdk.Messages.WebAPIOrgnanizationRequestProperties();
        request.CustomImplementation = ss.Delegate.create(this, this._customWebApiImplementation);
        return request;
    },
    
    _customWebApiImplementation: function SparkleXrm_Sdk_RetrieveRelationshipRequest$_customWebApiImplementation(request, callback, errorCallback, async) {
        var requestTyped = request;
        var query = "$filter=SchemaName eq '" + requestTyped.Name + "'";
        SparkleXrm.Sdk.WebApiOrganizationServiceProxy._sendRequest('RelationshipDefinition', 'RelationshipDefinitions', query, 'GET', null, async, function(state) {
            var data = SparkleXrm.Sdk.WebApiOrganizationServiceProxy._jsonParse(state);
            var value = data['value'];
            var response = new SparkleXrm.Sdk.RetrieveRelationshipResponse(null);
            var entityMetadata = value;
            response.RelationshipMetadata = entityMetadata[0];
            callback(response);
        }, errorCallback);
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.RetrieveRelationshipResponse

SparkleXrm.Sdk.RetrieveRelationshipResponse = function SparkleXrm_Sdk_RetrieveRelationshipResponse(response) {
    if (response == null) {
        return;
    }
    var results = SparkleXrm.Sdk.XmlHelper.selectSingleNode(response, 'Results');
    var $enum1 = ss.IEnumerator.getEnumerator(results.childNodes);
    while ($enum1.moveNext()) {
        var nameValuePair = $enum1.current;
        var key = SparkleXrm.Sdk.XmlHelper.selectSingleNode(nameValuePair, 'key');
        if (SparkleXrm.Sdk.XmlHelper.getNodeTextValue(key) === 'RelationshipMetadata') {
            var entity = SparkleXrm.Sdk.XmlHelper.selectSingleNode(nameValuePair, 'value');
            this.RelationshipMetadata = SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseRelationshipMetadata(entity);
        }
    }
}
SparkleXrm.Sdk.RetrieveRelationshipResponse.prototype = {
    RelationshipMetadata: null
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.WebApiRequestResponse

SparkleXrm.Sdk.WebApiRequestResponse = function SparkleXrm_Sdk_WebApiRequestResponse(request, logicalName) {
    this.response = request.responseText;
    this.headers = request.getAllResponseHeaders();
    this.logicalName = logicalName;
}
SparkleXrm.Sdk.WebApiRequestResponse.prototype = {
    response: null,
    headers: null,
    logicalName: null,
    _headers: null,
    
    getHeader: function SparkleXrm_Sdk_WebApiRequestResponse$getHeader(key) {
        if (this._headers == null) {
            this._headers = {};
            var pairs = this.headers.split('\r\n');
            var $enum1 = ss.IEnumerator.getEnumerator(pairs);
            while ($enum1.moveNext()) {
                var pair = $enum1.current;
                var tokens = pair.split(': ');
                if (tokens.length === 2) {
                    this._headers[tokens[0]] = tokens[1];
                }
            }
        }
        return this._headers[key];
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.WebApiOrganizationServiceProxy

SparkleXrm.Sdk.WebApiOrganizationServiceProxy = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy() {
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy.addNavigationPropertyMetadata = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$addNavigationPropertyMetadata(entityLogicalName, attributeLogicalName, navigationProperties) {
    var navigation = navigationProperties.split(',');
    var $enum1 = ss.IEnumerator.getEnumerator(navigation);
    while ($enum1.moveNext()) {
        var prop = $enum1.current;
        SparkleXrm.Sdk.WebApiOrganizationServiceProxy._navigationToLogicalNameMapping[entityLogicalName + '.' + navigationProperties] = attributeLogicalName;
    }
    SparkleXrm.Sdk.WebApiOrganizationServiceProxy._logicalNameToNavigationMapping[entityLogicalName + '.' + attributeLogicalName] = navigation;
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy.addMetadata = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$addMetadata(logicalName, entitySetName, primaryAttributeLogicalName) {
    var metadata = {};
    metadata.logicalName = logicalName;
    metadata.entitySetName = entitySetName;
    metadata.primaryAttributeLogicalName = primaryAttributeLogicalName;
    SparkleXrm.Sdk.WebApiOrganizationServiceProxy._webApiMetadata[logicalName] = metadata;
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getResource = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_getResource(setName, id) {
    return setName + '(' + SparkleXrm.Sdk.Guid.stripGuid(id) + ')';
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy.mapLookupsToEntitySets = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$mapLookupsToEntitySets(lookups, completeCallback, errorCallBack, async) {
    SparkleXrm.DelegateItterator.callbackItterate(function(index, nextCallBack, itterateErorCallBack) {
        var lookup = lookups[index];
        var logicalName = null;
        var resolveMetadata = null;
        if (Type.getInstanceType(lookup) === SparkleXrm.Sdk.EntityReference) {
            logicalName = (lookup).logicalName;
            resolveMetadata = function(metadata) {
                nextCallBack();
            };
        }
        else if (Type.getInstanceType(lookup) === SparkleXrm.Sdk.Entity) {
            logicalName = (lookup).logicalName;
            resolveMetadata = function(metadata) {
                (lookup)._entitySetName = metadata.entitySetName;
                nextCallBack();
            };
        }
        SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getEntityMetadata(logicalName, resolveMetadata, function(error) {
            itterateErorCallBack(error);
        }, async);
    }, lookups.length, completeCallback, function(ex) {
        errorCallBack(ex);
    });
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._jsonParse = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_jsonParse(state) {
    var response = state;
    var data = JSON.parse(response.response, SparkleXrm.Sdk.WebApiOrganizationServiceProxy.dateReviver);
    return data;
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getEntityMetadata = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_getEntityMetadata(logicalName, callback, error, async) {
    SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getEntityMetadataMultiple([logicalName], function(metadata) {
        callback(metadata[0]);
    }, error, async);
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getEntityMetadataMultiple = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_getEntityMetadataMultiple(logicalNames, callback, error, async) {
    var metaData = [];
    var logicalNamesRequest = [];
    var $enum1 = ss.IEnumerator.getEnumerator(logicalNames);
    while ($enum1.moveNext()) {
        var logicalName = $enum1.current;
        if (Object.keyExists(SparkleXrm.Sdk.WebApiOrganizationServiceProxy._webApiMetadata, logicalName)) {
            metaData.add(SparkleXrm.Sdk.WebApiOrganizationServiceProxy._webApiMetadata[logicalName]);
        }
        else {
            logicalNamesRequest.add(logicalName);
        }
    }
    if (!logicalNamesRequest.length) {
        callback(metaData);
        return;
    }
    SparkleXrm.Sdk.WebApiOrganizationServiceProxy._sendRequest(null, 'EntityDefinitions', "$select=EntitySetName,LogicalName,PrimaryIdAttribute&$filter=LogicalName+eq+'" + logicalNames.join("' or LogicalName+eq+'") + "'", 'GET', null, async, function(entitySetState) {
        var results = SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getResponseValue(SparkleXrm.Sdk.WebApiOrganizationServiceProxy._endRequest(entitySetState));
        var rows = results['value'];
        if (rows == null || rows.length !== logicalNames.length) {
            error(new Error(String.format("Invalid logical name(s) '{0}'", logicalNames)));
            return;
        }
        var $enum1 = ss.IEnumerator.getEnumerator(rows);
        while ($enum1.moveNext()) {
            var row = $enum1.current;
            var result = SparkleXrm.Sdk.WebApiOrganizationServiceProxy.getMetadata(row);
            metaData.add(result);
        }
        callback(metaData);
    }, error);
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy.getMetadata = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$getMetadata(row) {
    var metadata = {};
    metadata.logicalName = row['LogicalName'];
    metadata.primaryAttributeLogicalName = row['PrimaryIdAttribute'];
    metadata.entitySetName = row['EntitySetName'];
    SparkleXrm.Sdk.WebApiOrganizationServiceProxy._webApiMetadata[metadata.logicalName] = metadata;
    return metadata;
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._endRequest = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_endRequest(state) {
    if (Type.getInstanceType(state) === SparkleXrm.Sdk.WebApiRequestResponse) {
        return state;
    }
    else {
        throw state;
    }
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._sendRequest = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_sendRequest(logicalname, resource, query, method, data, isAsync, callBack, error) {
    var req = new XMLHttpRequest();
    var url = SparkleXrm.Sdk.WebApiOrganizationServiceProxy._buildRequestUrl(resource, query);
    req.open(method, encodeURI(url), isAsync);
    SparkleXrm.Sdk.WebApiOrganizationServiceProxy._setHeaders(req, null, resource.endsWith('$batch'));
    if (isAsync) {
        req.onreadystatechange = function() {
            SparkleXrm.Sdk.WebApiOrganizationServiceProxy._onReadyCallBack(req, function(request) {
                var response = new SparkleXrm.Sdk.WebApiRequestResponse(request, logicalname);
                delete req;
                callBack(response);
            }, error);
        };
        req.send(data);
    }
    else {
        delete req;
        req.send(data);
        SparkleXrm.Sdk.WebApiOrganizationServiceProxy._onReadyCallBack(req, function(request) {
            var response = new SparkleXrm.Sdk.WebApiRequestResponse(request, logicalname);
            callBack(response);
        }, error);
    }
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._buildRequestUrl = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_buildRequestUrl(resource, query) {
    var url = SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getWebAPIPath() + resource;
    if (!String.isNullOrEmpty(query)) {
        url += ('?' + query);
    }
    return url;
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._onReadyCallBack = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_onReadyCallBack(req, callBack, errorCallBack) {
    if (req.readyState === 4) {
        req.onreadystatechange = null;
        switch (req.status) {
            case 200:
            case 204:
            case 304:
                callBack(req);
                break;
            default:
                var exception = null;
                try {
                    var responseError = JSON.parse(req.responseText, null);
                    exception = SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getResponseException(responseError);
                }
                catch (ex) {
                    exception = ex;
                }
                errorCallBack(exception);
                break;
        }
    }
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getResponseException = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_getResponseException(responseError) {
    var exception;
    var message = 'Unknown';
    if (!String.isNullOrEmpty(responseError.Message)) {
        message = responseError.Message;
    }
    else if (responseError.error != null) {
        message = responseError.error.message;
    }
    exception = new Error(message);
    if (responseError.error != null && responseError.error.stacktrace != null) {
        ss.Debug.writeln(responseError.error.stacktrace);
    }
    return exception;
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy.dateReviver = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$dateReviver(key, value) {
    if (String === Type.getInstanceType(value)) {
        var d = new RegExp('^(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2}):(\\d{2}(?:\\.\\d *)?)Z$').exec(value);
        if (d != null) {
            return new Date(Date.UTC(parseInt(d[1]), parseInt(d[2]) - 1, parseInt(d[3]), parseInt(d[4]), parseInt(d[5]), parseInt(d[6])));
        }
        var g = new RegExp('^[{(]?[0-9A-F]{8}[-]?([0-9A-F]{4}[-]?){3}[0-9A-F]{12}[)}]?$').exec(value);
        if (g != null) {
            return new SparkleXrm.Sdk.Guid(value);
        }
    }
    return value;
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getResponseValue = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_getResponseValue(response) {
    var responseText = response.response;
    if (responseText.startsWith('--batchresponse')) {
        var batchResponse = {};
        batchResponse.batches = [];
        var parsePosition = 0;
        var batchName = '--batchresponse';
        while (true) {
            parsePosition = responseText.indexOf(batchName, parsePosition);
            if (parsePosition === -1) {
                break;
            }
            var lfPos = responseText.indexOf('\n', parsePosition);
            batchName = responseText.substring(parsePosition, lfPos - 1);
            var batch = {};
            batch.batchId = batchName;
            var httpResponseHeader = 'HTTP/1.1';
            var httpPos = responseText.indexOf(httpResponseHeader);
            if (httpPos > -1) {
                var httpPosSpace = responseText.indexOf(' ', httpPos + httpResponseHeader.length + 1);
                batch.httpResponseCode = parseInt(responseText.substring(httpPos + httpResponseHeader.length + 1, httpPosSpace));
            }
            var batchEndPos = responseText.indexOf(batchName, lfPos);
            if (batchEndPos > -1) {
                var startPos = responseText.indexOf('{');
                var batchText = responseText.substring(startPos, batchEndPos);
                parsePosition = batchEndPos + 1;
                batch.response = JSON.parse(batchText, SparkleXrm.Sdk.WebApiOrganizationServiceProxy.dateReviver);
                batchResponse.batches.add(batch);
            }
        }
        return batchResponse;
    }
    else {
        return JSON.parse(responseText, SparkleXrm.Sdk.WebApiOrganizationServiceProxy.dateReviver);
    }
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._setHeaders = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_setHeaders(req, pageSize, isBatch) {
    req.setRequestHeader('Accept', 'application/json');
    if (isBatch) {
        req.setRequestHeader('Content-Type', 'multipart/mixed;boundary=batch_boundary');
    }
    else {
        req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    }
    req.setRequestHeader('OData-MaxVersion', '4.0');
    req.setRequestHeader('OData-Version', '4.0');
    req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
    if (pageSize != null) {
        req.setRequestHeader('Prefer', 'odata.maxpagesize=' + pageSize);
    }
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getWebAPIPath = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_getWebAPIPath() {
    return SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getClientUrl() + '/api/data/v' + SparkleXrm.Sdk.WebApiOrganizationServiceProxy._webAPIVersion + '/';
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getClientUrl = function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_getClientUrl() {
    if (SparkleXrm.Sdk.WebApiOrganizationServiceProxy._clientUrl == null) {
        SparkleXrm.Sdk.WebApiOrganizationServiceProxy._clientUrl = Xrm.Page.context.getClientUrl();
        var apiVersion = Xrm.Page.context.getVersion();
        if (!String.isNullOrEmpty(apiVersion)) {
            var major = apiVersion.indexOf('.');
            var minor = apiVersion.indexOf('.', major + 1);
            SparkleXrm.Sdk.WebApiOrganizationServiceProxy._webAPIVersion = apiVersion.substr(0, minor);
        }
    }
    return SparkleXrm.Sdk.WebApiOrganizationServiceProxy._clientUrl;
}
SparkleXrm.Sdk.WebApiOrganizationServiceProxy.prototype = {
    
    doesNNAssociationExist: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$doesNNAssociationExist(relationship, Entity1, Entity2) {
        throw new Error('Not Implemented');
    },
    
    setState: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$setState(id, entityName, stateCode, statusCode) {
        throw new Error('Not Implemented');
    },
    
    beginSetState: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$beginSetState(id, entityName, stateCode, statusCode, callBack) {
        throw new Error('Not Implemented');
    },
    
    endSetState: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$endSetState(asyncState) {
        throw new Error('Not Implemented');
    },
    
    getUserSettings: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$getUserSettings() {
        if (SparkleXrm.Sdk.OrganizationServiceProxy.userSettings == null) {
            SparkleXrm.Sdk.OrganizationServiceProxy.userSettings = SparkleXrm.Sdk.OrganizationServiceProxy.retrieve(SparkleXrm.Sdk.UserSettings.entityLogicalName, Xrm.Page.context.getUserId(), [ 'timeformatstring', 'dateformatstring' ]);
            SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.timeformatstring = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.timeformatstring.replaceAll(':', SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.timeseparator);
            SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.dateformatstring = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.dateformatstring.replaceAll('/', SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.dateseparator);
            SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.dateformatstring = SparkleXrm.Sdk.OrganizationServiceProxy.userSettings.dateformatstring.replaceAll('MM', 'mm').replaceAll('yyyy', 'UU').replaceAll('yy', 'y').replaceAll('UU', 'yy').replaceAll('M', 'm');
        }
        if (SparkleXrm.Sdk.OrganizationServiceProxy.organizationSettings == null) {
            var fetchXml = "<fetch>\r\n                                    <entity name='organization' >\r\n                                        <attribute name='weekstartdaycode' />\r\n                                    </entity>\r\n                                </fetch>";
            SparkleXrm.Sdk.OrganizationServiceProxy.organizationSettings = this.retrieveMultiple(fetchXml).entities.get_item(0);
        }
        return SparkleXrm.Sdk.OrganizationServiceProxy.userSettings;
    },
    
    create: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$create(entity) {
        return this._beginCreateInternal(entity, null);
    },
    
    beginCreate: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$beginCreate(entity, callBack) {
        this._beginCreateInternal(entity, callBack);
    },
    
    _beginCreateInternal: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_beginCreateInternal(entity, callBack) {
        var id = null;
        var async = !ss.isNullOrUndefined(callBack);
        var errorCallback = (!async) ? ss.Delegate.create(this, this._throwErrorCallback) : callBack;
        var endCallback = (!async) ? ss.Delegate.create(this, function(state) {
            id = this.endCreate(state);
        }) : callBack;
        SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getEntityMetadata(entity.logicalName, function(metadata) {
            SparkleXrm.Sdk.Entity._serialiseWebApi(entity, function(jsonData) {
                var jsonDataDictionary = jsonData;
                var $enum1 = ss.IEnumerator.getEnumerator(Object.keys(jsonDataDictionary));
                while ($enum1.moveNext()) {
                    var attribute = $enum1.current;
                    if (attribute.endsWith('@odata.bind') && jsonDataDictionary[attribute] == null) {
                        delete jsonData[attribute];
                    }
                }
                var json = JSON.stringify(jsonData);
                SparkleXrm.Sdk.WebApiOrganizationServiceProxy._sendRequest(entity.logicalName, metadata.entitySetName, null, 'POST', json, async, endCallback, errorCallback);
            }, errorCallback, async);
        }, errorCallback, async);
        return id;
    },
    
    endCreate: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$endCreate(asyncState) {
        this._checkEndException(asyncState);
        var response = asyncState;
        var headerId = response.getHeader('OData-EntityId');
        if (headerId == null) {
            headerId = response.getHeader('odata-entityid');
        }
        var guidExpr = new RegExp('\\(([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\\)', 'g');
        var parts = guidExpr.exec(headerId);
        if (parts.length > 0) {
            return new SparkleXrm.Sdk.Guid(parts[1]);
        }
        else {
            throw new Error('Invalid response');
        }
    },
    
    update: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$update(entity) {
        this.beginUpdateInternal(entity, null);
    },
    
    beginUpdate: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$beginUpdate(entity, callBack) {
        this.beginUpdateInternal(entity, callBack);
    },
    
    beginUpdateInternal: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$beginUpdateInternal(entity, callBack) {
        var async = !ss.isNullOrUndefined(callBack);
        var errorCallback = (!async) ? ss.Delegate.create(this, this._throwErrorCallback) : callBack;
        var endCallback = (!async) ? ss.Delegate.create(this, this.endUpdate) : callBack;
        SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getEntityMetadata(entity.logicalName, function(metadata) {
            SparkleXrm.Sdk.Entity._serialiseWebApi(entity, function(jsonData) {
                var jsonDataDictionary = jsonData;
                var lookupsToRemove = [];
                var $enum1 = ss.IEnumerator.getEnumerator(Object.keys(jsonDataDictionary));
                while ($enum1.moveNext()) {
                    var attribute = $enum1.current;
                    if (attribute.endsWith('@odata.bind') && jsonDataDictionary[attribute] == null) {
                        lookupsToRemove.add(attribute);
                    }
                }
                SparkleXrm.DelegateItterator.callbackItterate(function(index, nextCallBack, errorCallBack) {
                    var attribute = lookupsToRemove[index];
                    var lookupattribute = attribute.substr(0, attribute.length - 11);
                    delete jsonData[attribute];
                    SparkleXrm.Sdk.WebApiOrganizationServiceProxy._sendRequest(entity.logicalName, SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getResource(metadata.entitySetName, entity.id) + '/' + lookupattribute + '/$ref', null, 'DELETE', null, async, function(state) {
                        nextCallBack();
                    }, errorCallback);
                }, lookupsToRemove.length, function() {
                    var json = JSON.stringify(jsonData);
                    SparkleXrm.Sdk.WebApiOrganizationServiceProxy._sendRequest(entity.logicalName, SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getResource(metadata.entitySetName, entity.id), null, 'PATCH', json, async, endCallback, errorCallback);
                }, function(ex) {
                    errorCallback(ex);
                });
            }, errorCallback, async);
        }, errorCallback, async);
    },
    
    endUpdate: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$endUpdate(asyncState) {
        this._checkEndException(asyncState);
    },
    
    delete_: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$delete_(logicalName, guid) {
        this._deleteInternal(logicalName, guid, null);
        return null;
    },
    
    beginDelete: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$beginDelete(logicalName, guid, callBack) {
        this._deleteInternal(logicalName, guid, callBack);
    },
    
    _deleteInternal: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_deleteInternal(logicalName, guid, callBack) {
        var async = !ss.isNullOrUndefined(callBack);
        var errorCallback = (!async) ? ss.Delegate.create(this, this._throwErrorCallback) : callBack;
        var endCallback = (!async) ? ss.Delegate.create(this, this.endDelete) : callBack;
        SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getEntityMetadata(logicalName, function(metadata) {
            SparkleXrm.Sdk.WebApiOrganizationServiceProxy._sendRequest(logicalName, SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getResource(metadata.entitySetName, guid.value), null, 'DELETE', null, async, endCallback, errorCallback);
        }, errorCallback, async);
    },
    
    endDelete: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$endDelete(asyncState) {
        this._checkEndException(asyncState);
    },
    
    _checkEndException: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_checkEndException(asyncState) {
        if (Type.getInstanceType(asyncState) === Error) {
            throw asyncState;
        }
    },
    
    execute: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$execute(request) {
        return this._beginExecuteInternal(request, null);
    },
    
    beginExecute: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$beginExecute(request, callBack) {
        this._beginExecuteInternal(request, callBack);
    },
    
    _beginExecuteInternal: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_beginExecuteInternal(request, callBack) {
        var webApiRequest = request;
        var requestProperties = null;
        try {
            requestProperties = webApiRequest.serialiseWebApi();
        }
        catch (ex) {
            throw new Error('Cannot create webapi request ' + ex.message);
        }
        var response = null;
        var async = !ss.isNullOrUndefined(callBack);
        var errorCallback = (!async) ? ss.Delegate.create(this, this._throwErrorCallback) : callBack;
        var requestname = (requestProperties.RequestName != null) ? requestProperties.RequestName.replaceAll('Microsoft.Dynamics.CRM.', '') : '';
        var customImplementation = (requestProperties.CustomImplementation != null);
        var endCallback = (!async) ? ss.Delegate.create(this, function(state) {
            if (customImplementation) {
                state._customImplementation = true;
            }
            state._requestName = requestname;
            response = this.endExecute(state);
        }) : function(state) {
            if (customImplementation) {
                state._customImplementation = true;
            }
            state._requestName = requestname;
            callBack(state);
        };
        if (customImplementation) {
            requestProperties.CustomImplementation(request, endCallback, errorCallback, async);
            return response;
        }
        var operation = (requestProperties.OperationType === 'functionCall') ? 'GET' : 'POST';
        var requestMetadata = null;
        var serialseParametersCallback = function(parameters) {
            var functionParametersString = '';
            var parametersValuesString = '';
            var jsonBody = '';
            if (requestProperties.OperationType === 'functionCall') {
                var functionParameters = [];
                var queryString = [];
                var count = 1;
                var $enum1 = ss.IEnumerator.getEnumerator(Object.keys(parameters));
                while ($enum1.moveNext()) {
                    var key = $enum1.current;
                    var parameterName = '@p' + count.toString();
                    var parameterValue = parameters[key];
                    var parameterType = Type.getInstanceType(parameterValue);
                    if (parameterType === String) {
                        parameterValue = "'" + (parameterValue).replaceAll("'", "'") + "'";
                    }
                    else {
                        parameterValue = JSON.stringify(parameterValue);
                    }
                    functionParameters.add(key + '=' + parameterName);
                    queryString.add(parameterName + '=' + parameterValue);
                    count++;
                }
                functionParametersString = functionParameters.join(',');
                parametersValuesString = queryString.join('&');
            }
            else {
                jsonBody = JSON.stringify(parameters);
            }
            var entitySetName = (requestMetadata != null) ? requestMetadata.entitySetName : null;
            var boundEntityId = (requestProperties.BoundEntityId != null) ? requestProperties.BoundEntityId.value : null;
            var resourceName = (entitySetName != null) ? SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getResource(entitySetName, boundEntityId) + '/' : '';
            SparkleXrm.Sdk.WebApiOrganizationServiceProxy._sendRequest(requestProperties.BoundEntityLogicalName, resourceName + requestProperties.RequestName + '(' + functionParametersString + ')', parametersValuesString, operation, jsonBody, async, endCallback, errorCallback);
        };
        if (requestProperties.BoundEntityLogicalName != null) {
            SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getEntityMetadata(requestProperties.BoundEntityLogicalName, ss.Delegate.create(this, function(metadata) {
                requestMetadata = metadata;
                this._serialiseFunctionParameterString(requestProperties, serialseParametersCallback, errorCallback, async);
            }), errorCallback, async);
        }
        else {
            this._serialiseFunctionParameterString(requestProperties, serialseParametersCallback, errorCallback, async);
        }
        return response;
    },
    
    _serialiseFunctionParameterString: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_serialiseFunctionParameterString(requestProperties, completeCallback, errorCallBack, async) {
        var properties = {};
        var lookupsToResolve = [];
        var additionalProperties = requestProperties.AdditionalProperties;
        var $enum1 = ss.IEnumerator.getEnumerator(Object.keys(additionalProperties));
        while ($enum1.moveNext()) {
            var key = $enum1.current;
            var value = additionalProperties[key];
            var valueType = Type.getInstanceType(value);
            if (valueType === SparkleXrm.Sdk.EntityReference || valueType === SparkleXrm.Sdk.Entity) {
                lookupsToResolve.add(value);
            }
            properties[key] = value;
        }
        SparkleXrm.Sdk.WebApiOrganizationServiceProxy.mapLookupsToEntitySets(lookupsToResolve, function() {
            SparkleXrm.DelegateItterator.callbackItterate(function(index, nextPropertyCallBack, propertyError) {
                var key = Object.keys(properties)[index];
                var propertyValue = properties[key];
                SparkleXrm.Sdk.Attribute._serialiseWebApiAttribute(Type.getInstanceType(propertyValue), propertyValue, function(value) {
                    properties[key] = value;
                    nextPropertyCallBack();
                }, errorCallBack, async);
            }, Object.getKeyCount(properties), function() {
                completeCallback(properties);
            }, function(ex) {
                errorCallBack(ex);
            });
        }, errorCallBack, async);
    },
    
    _serialiseRequestToJSON: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_serialiseRequestToJSON(requestProperties, completeCallback, errorCallBack, async) {
        SparkleXrm.DelegateItterator.callbackItterate(function(index, nextCallBack, parameterError) {
        }, Object.getKeyCount(requestProperties.AdditionalProperties), function() {
        }, function(ex) {
            errorCallBack(ex);
        });
    },
    
    endExecute: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$endExecute(asyncState) {
        this._checkEndException(asyncState);
        var type = asyncState._requestName;
        var customImplementation = ('_customImplementation' in asyncState);
        if (customImplementation) {
            return asyncState;
        }
        return null;
    },
    
    retrieveMultiple: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$retrieveMultiple(fetchXml) {
        return this._beginRetrieveMultipleInternal(fetchXml, SparkleXrm.Sdk.Entity, null);
    },
    
    beginRetrieveMultiple: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$beginRetrieveMultiple(fetchXml, callBack) {
        this._beginRetrieveMultipleInternal(fetchXml, null, callBack);
    },
    
    _beginRetrieveMultipleInternal: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_beginRetrieveMultipleInternal(fetchXml, entityType, callBack) {
        var response = null;
        var async = !ss.isNullOrUndefined(callBack);
        var errorCallback = (!async) ? ss.Delegate.create(this, this._throwErrorCallback) : callBack;
        var endCallback = (!async) ? ss.Delegate.create(this, function(state) {
            response = this.endRetrieveMultiple(state, entityType);
        }) : callBack;
        var logicalName = '';
        try {
            var doc = SparkleXrm.Sdk.XmlHelper.loadXml(fetchXml);
            var fetch = doc.childNodes[0];
            var $enum1 = ss.IEnumerator.getEnumerator(fetch.childNodes);
            while ($enum1.moveNext()) {
                var node = $enum1.current;
                if (node.nodeName.toLowerCase() === 'entity') {
                    var $enum2 = ss.IEnumerator.getEnumerator(node.attributes);
                    while ($enum2.moveNext()) {
                        var attr = $enum2.current;
                        if (attr.name.toLowerCase() === 'name') {
                            logicalName = attr.value;
                            break;
                        }
                    }
                    break;
                }
            }
        }
        catch (ex) {
            throw new Error('Invalid FetchXml ' + ex.message);
        }
        SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getEntityMetadata(logicalName, ss.Delegate.create(this, function(metadata) {
            var query = 'fetchXml=' + encodeURIComponent(fetchXml);
            var url = SparkleXrm.Sdk.WebApiOrganizationServiceProxy._buildRequestUrl(metadata.entitySetName, query);
            var resource = metadata.entitySetName;
            var method = 'GET';
            var json = null;
            if (this._urlTooLong(url)) {
                resource = '$batch';
                query = null;
                json = this._getBatchRequest(url);
                method = 'POST';
            }
            SparkleXrm.Sdk.WebApiOrganizationServiceProxy._sendRequest(logicalName, resource, query, method, json, async, endCallback, errorCallback);
        }), errorCallback, async);
        return response;
    },
    
    _urlTooLong: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_urlTooLong(url) {
        return url.length > 2048;
    },
    
    _getBatchRequest: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_getBatchRequest(url) {
        return '--batch_boundary\r\nContent-Type: application/http\r\nContent-Transfer-Encoding: binary\r\n\r\nGET ' + encodeURI(url) + ' HTTP/1.1\r\nContent-Type: application/json\r\nOData-Version: 4.0\r\nOData-MaxVersion: 4.0\r\n\r\n--batch_boundary--';
    },
    
    retrieve: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$retrieve(entityName, entityId, attributesList) {
        return this.beginRetrieveInternal(entityName, entityId, attributesList, null);
    },
    
    beginRetrieveInternal: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$beginRetrieveInternal(entityName, entityId, attributesList, callBack) {
        var result = null;
        var isAsync = !ss.isNullOrUndefined(callBack);
        var errorCallback = (!isAsync) ? ss.Delegate.create(this, this._throwErrorCallback) : callBack;
        var endCallback = (!isAsync) ? ss.Delegate.create(this, function(state) {
            result = this.endRetrieve([ state, entityName ], SparkleXrm.Sdk.Entity);
        }) : function(state) {
            callBack([ state, entityName ]);
        };
        var containsActivityParties = false;
        var selectAttributes = [];
        var $enum1 = ss.IEnumerator.getEnumerator(attributesList);
        while ($enum1.moveNext()) {
            var attributeLogicalName = $enum1.current;
            var selectAttribute = attributeLogicalName;
            var key = entityName + '.' + attributeLogicalName;
            if (Object.keyExists(SparkleXrm.Sdk.WebApiOrganizationServiceProxy._logicalNameToNavigationMapping, key)) {
                selectAttribute = '_' + attributeLogicalName + '_value';
            }
            if (SparkleXrm.StringEx.IN(attributeLogicalName, SparkleXrm.Sdk.WebApiOrganizationServiceProxy._partyListAttributes)) {
                containsActivityParties = true;
                selectAttribute = null;
            }
            if (selectAttribute != null) {
                selectAttributes.add(selectAttribute);
            }
        }
        SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getEntityMetadata(entityName, ss.Delegate.create(this, function(metadata) {
            var select = [];
            if (selectAttributes != null && selectAttributes.length > 0) {
                select.add('$select=' + selectAttributes.join(','));
            }
            if (containsActivityParties) {
                select.add('$expand=email_activity_parties($select=activitypartyid,_partyid_value,participationtypemask)');
            }
            SparkleXrm.Sdk.WebApiOrganizationServiceProxy._sendRequest(metadata.logicalName, this._getRecordUrl(metadata, entityId), select.join('&'), 'GET', null, isAsync, endCallback, errorCallback);
        }), errorCallback, isAsync);
        return result;
    },
    
    beginRetrieve: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$beginRetrieve(entityName, entityId, attributesList, callBack) {
        this.beginRetrieveInternal(entityName, entityId, attributesList, callBack);
    },
    
    endRetrieve: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$endRetrieve(asyncState, entityType) {
        this._checkEndException(asyncState);
        var asyncStateValues = asyncState;
        var result = new SparkleXrm.Sdk.Entity(asyncStateValues[1]);
        result.deSerialiseWebApi(SparkleXrm.Sdk.WebApiOrganizationServiceProxy._jsonParse(asyncStateValues[0]));
        return result;
    },
    
    _getRecordUrl: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_getRecordUrl(metadata, id) {
        id = id.replace(new RegExp('[{}]', 'g'), '');
        return metadata.entitySetName + '(' + id + ')';
    },
    
    associate: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$associate(entityName, entityId, relationship, relatedEntities) {
        this.beginAssociateInternal(entityName, true, entityId, relationship, relatedEntities, null);
    },
    
    beginAssociate: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$beginAssociate(entityName, entityId, relationship, relatedEntities, callBack) {
        this.beginAssociateInternal(entityName, true, entityId, relationship, relatedEntities, callBack);
    },
    
    beginAssociateInternal: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$beginAssociateInternal(entityName, isAssociate, entityId, relationship, relatedEntities, callBack) {
        var async = !ss.isNullOrUndefined(callBack);
        var errorCallback = (!async) ? ss.Delegate.create(this, this._throwErrorCallback) : callBack;
        var endCallback = (!async) ? ss.Delegate.create(this, function(state) {
            this.endAssociate(state);
        }) : callBack;
        var logicalNames = [];
        logicalNames.add(entityName);
        var $enum1 = ss.IEnumerator.getEnumerator(relatedEntities);
        while ($enum1.moveNext()) {
            var entityRef = $enum1.current;
            logicalNames.add(entityRef.logicalName);
        }
        SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getEntityMetadataMultiple(logicalNames, ss.Delegate.create(this, function(metadata) {
            SparkleXrm.DelegateItterator.callbackItterate(ss.Delegate.create(this, function(index, nextCallBack, errorCallBack) {
                var associateto = relatedEntities[index];
                SparkleXrm.Sdk.Attribute._serialiseWebApiAttribute(SparkleXrm.Sdk.EntityReference, associateto, ss.Delegate.create(this, function(value) {
                    var queryString = null;
                    var json = null;
                    var resource = SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getWebAPIPath() + value['@odata.id'];
                    if (isAssociate) {
                        value['@odata.id'] = resource;
                        json = JSON.stringify(value);
                    }
                    else {
                        queryString = '$id=' + resource;
                    }
                    var targetMetadata = SparkleXrm.Sdk.WebApiOrganizationServiceProxy._webApiMetadata[entityName];
                    var associateMetadata = SparkleXrm.Sdk.WebApiOrganizationServiceProxy._webApiMetadata[associateto.logicalName];
                    SparkleXrm.Sdk.WebApiOrganizationServiceProxy._sendRequest(entityName, this._getRecordUrl(targetMetadata, entityId.value) + '/' + relationship.schemaName + '/$ref', queryString, (isAssociate) ? 'POST' : 'DELETE', json, false, endCallback, errorCallback);
                }), errorCallback, async);
            }), relatedEntities.length, function() {
                callBack(null);
            }, function(ex) {
                errorCallback(ex);
            });
        }), errorCallback, async);
    },
    
    endAssociate: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$endAssociate(asyncState) {
        this._checkEndException(asyncState);
    },
    
    disassociate: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$disassociate(entityName, entityId, relationship, relatedEntities) {
        this.beginAssociateInternal(entityName, false, entityId, relationship, relatedEntities, null);
    },
    
    beginDisassociate: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$beginDisassociate(entityName, entityId, relationship, relatedEntities, callBack) {
        this.beginAssociateInternal(entityName, false, entityId, relationship, relatedEntities, callBack);
    },
    
    endDisassociate: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$endDisassociate(asyncState) {
        this._checkEndException(asyncState);
    },
    
    _throwErrorCallback: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_throwErrorCallback(exception) {
        if (Type.getInstanceType(exception) === Error) {
            throw exception;
        }
        else {
            throw new Error(exception);
        }
    },
    
    _getResponseValueArray: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$_getResponseValueArray(response) {
        return response['value'];
    },
    
    endRetrieveMultiple: function SparkleXrm_Sdk_WebApiOrganizationServiceProxy$endRetrieveMultiple(asyncState, entityType) {
        this._checkEndException(asyncState);
        var response = asyncState;
        var results = SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getResponseValue(response);
        var collection = null;
        if (Object.keyExists(results, 'batches')) {
            var batchResponse = results;
            var innerResponse = batchResponse.batches[0];
            if (innerResponse.httpResponseCode === 500 || innerResponse.httpResponseCode === 400) {
                var error = SparkleXrm.Sdk.WebApiOrganizationServiceProxy._getResponseException(innerResponse.response);
                throw error;
            }
            collection = SparkleXrm.Sdk.EntityCollection.deserialiseWebApi(entityType, response.logicalName, innerResponse.response);
        }
        else {
            collection = SparkleXrm.Sdk.EntityCollection.deserialiseWebApi(entityType, response.logicalName, results);
        }
        return collection;
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.XmlHelper

SparkleXrm.Sdk.XmlHelper = function SparkleXrm_Sdk_XmlHelper() {
}
SparkleXrm.Sdk.XmlHelper.encode = function SparkleXrm_Sdk_XmlHelper$encode(value) {
    if (value == null) {
        return value;
    }
    return value.replace(new RegExp("([\\&\"<>'])", 'g'), SparkleXrm.Sdk.XmlHelper.replaceCallBackEncode);
}
SparkleXrm.Sdk.XmlHelper.serialiseNode = function SparkleXrm_Sdk_XmlHelper$serialiseNode(node) {
    if (typeof(node.xml) === 'undefined') {
        return new XMLSerializer().serializeToString(node);
    }
    else {
        return node.xml;
    }
}
SparkleXrm.Sdk.XmlHelper.Decode = function SparkleXrm_Sdk_XmlHelper$Decode(value) {
    if (value == null) {
        return null;
    }
    return value.replace(new RegExp('(&quot;|&lt;|&gt;|&amp;|&#39;)', 'g'), SparkleXrm.Sdk.XmlHelper.replaceCallBackDecode);
}
SparkleXrm.Sdk.XmlHelper.replaceCallBackEncode = function SparkleXrm_Sdk_XmlHelper$replaceCallBackEncode(item) {
    return SparkleXrm.Sdk.XmlHelper._encode_map[item];
}
SparkleXrm.Sdk.XmlHelper.replaceCallBackDecode = function SparkleXrm_Sdk_XmlHelper$replaceCallBackDecode(item) {
    return SparkleXrm.Sdk.XmlHelper._decode_map[item];
}
SparkleXrm.Sdk.XmlHelper.selectSingleNodeValue = function SparkleXrm_Sdk_XmlHelper$selectSingleNodeValue(doc, baseName) {
    var node = SparkleXrm.Sdk.XmlHelper.selectSingleNode(doc, baseName);
    if (node != null) {
        return SparkleXrm.Sdk.XmlHelper.getNodeTextValue(node);
    }
    else {
        return null;
    }
}
SparkleXrm.Sdk.XmlHelper.selectSingleNode = function SparkleXrm_Sdk_XmlHelper$selectSingleNode(doc, baseName) {
    var $enum1 = ss.IEnumerator.getEnumerator(doc.childNodes);
    while ($enum1.moveNext()) {
        var n = $enum1.current;
        if (SparkleXrm.Sdk.XmlHelper.getLocalName(n) === baseName) {
            return n;
        }
    }
    return null;
}
SparkleXrm.Sdk.XmlHelper.getLocalName = function SparkleXrm_Sdk_XmlHelper$getLocalName(node) {
    if (node.baseName != null) {
        return node.baseName;
    }
    else {
        return node.localName;
    }
}
SparkleXrm.Sdk.XmlHelper.selectSingleNodeValueDeep = function SparkleXrm_Sdk_XmlHelper$selectSingleNodeValueDeep(doc, baseName) {
    var node = SparkleXrm.Sdk.XmlHelper.selectSingleNodeDeep(doc, baseName);
    if (node != null) {
        return SparkleXrm.Sdk.XmlHelper.getNodeTextValue(node);
    }
    else {
        return null;
    }
}
SparkleXrm.Sdk.XmlHelper.selectSingleNodeDeep = function SparkleXrm_Sdk_XmlHelper$selectSingleNodeDeep(doc, baseName) {
    var $enum1 = ss.IEnumerator.getEnumerator(doc.childNodes);
    while ($enum1.moveNext()) {
        var n = $enum1.current;
        if (SparkleXrm.Sdk.XmlHelper.getLocalName(n) === baseName) {
            return n;
        }
        var resultDeep = SparkleXrm.Sdk.XmlHelper.selectSingleNodeDeep(n, baseName);
        if (resultDeep != null) {
            return resultDeep;
        }
    }
    return null;
}
SparkleXrm.Sdk.XmlHelper.nsResolver = function SparkleXrm_Sdk_XmlHelper$nsResolver(prefix) {
    switch (prefix) {
        case 's':
            return 'http://schemas.xmlsoap.org/soap/envelope/';
        case 'a':
            return 'http://schemas.microsoft.com/xrm/2011/Contracts';
        case 'i':
            return 'http://www.w3.org/2001/XMLSchema-instance';
        case 'b':
            return 'http://schemas.datacontract.org/2004/07/System.Collections.Generic';
        case 'c':
            return 'http://schemas.microsoft.com/xrm/2011/Metadata';
        default:
            return null;
    }
}
SparkleXrm.Sdk.XmlHelper.isSelectSingleNodeUndefined = function SparkleXrm_Sdk_XmlHelper$isSelectSingleNodeUndefined(value) {
    return typeof (value.selectSingleNode) === 'undefined';
}
SparkleXrm.Sdk.XmlHelper.isXPathEvaluatorUndefined = function SparkleXrm_Sdk_XmlHelper$isXPathEvaluatorUndefined() {
    return typeof XPathEvaluator === 'undefined';
}
SparkleXrm.Sdk.XmlHelper.loadXml = function SparkleXrm_Sdk_XmlHelper$loadXml(xml) {
    if (typeof (ActiveXObject) === 'undefined') {
        var domParser = new DOMParser();
        return domParser.parseFromString(xml, 'text/xml');
    }
    else {
        var xmlDOM = (new ActiveXObject('Msxml2.DOMDocument'));
        xmlDOM.async = false;
        xmlDOM.loadXML(xml);
        xmlDOM.setProperty('SelectionLanguage', 'XPath');
        return xmlDOM;
    }
}
SparkleXrm.Sdk.XmlHelper.selectSingleNodeXpath = function SparkleXrm_Sdk_XmlHelper$selectSingleNodeXpath(node, xpath) {
    if (!SparkleXrm.Sdk.XmlHelper.isSelectSingleNodeUndefined(node) || SparkleXrm.Sdk.XmlHelper.isXPathEvaluatorUndefined()) {
        return node.selectSingleNode(xpath);
    }
    else {
        var xpe = new XPathEvaluator();
        var xPathNode = xpe.evaluate(xpath, node, SparkleXrm.Sdk.XmlHelper.nsResolver, 9, null);
        return (xPathNode != null) ? xPathNode.singleNodeValue : null;
    }
}
SparkleXrm.Sdk.XmlHelper.getNodeTextValue = function SparkleXrm_Sdk_XmlHelper$getNodeTextValue(node) {
    if ((node != null) && (node.firstChild != null)) {
        return node.firstChild.nodeValue;
    }
    else {
        return null;
    }
}
SparkleXrm.Sdk.XmlHelper.getAttributeValue = function SparkleXrm_Sdk_XmlHelper$getAttributeValue(node, attributeName) {
    var attribute = node.attributes.getNamedItem(attributeName);
    if (attribute != null) {
        return attribute.nodeValue;
    }
    else {
        return null;
    }
}


Type.registerNamespace('SparkleXrm.Sdk.Messages');

Type.registerNamespace('Xrm.Sdk.Messages');


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.EntityFilters

SparkleXrm.Sdk.Messages.EntityFilters = function() { };
SparkleXrm.Sdk.Messages.EntityFilters.prototype = {
    default_: 1, 
    entity: 1, 
    attributes: 2, 
    privileges: 4, 
    relationships: 8, 
    all: 15
}
SparkleXrm.Sdk.Messages.EntityFilters.registerEnum('SparkleXrm.Sdk.Messages.EntityFilters', true);


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.AddToQueueRequest

SparkleXrm.Sdk.Messages.AddToQueueRequest = function SparkleXrm_Sdk_Messages_AddToQueueRequest() {
}
SparkleXrm.Sdk.Messages.AddToQueueRequest.prototype = {
    DestinationQueueId: null,
    Target: null,
    
    serialise: function SparkleXrm_Sdk_Messages_AddToQueueRequest$serialise() {
        return '<d:request>' + '<a:Parameters>' + '<a:KeyValuePairOfstringanyType>' + '<b:key>DestinationQueueId</b:key>' + ((this.DestinationQueueId == null) ? '<b:value i:nil="true" />' : '<b:value i:type="e:guid">' + this.DestinationQueueId.toString() + '</b:value>') + '</a:KeyValuePairOfstringanyType>' + '<a:KeyValuePairOfstringanyType>' + '<b:key>Target</b:key>' + ((this.Target == null) ? '<b:value i:nil="true" />' : SparkleXrm.Sdk.Attribute.serialiseValue(this.Target, null)) + '</a:KeyValuePairOfstringanyType>' + '</a:Parameters>' + '<a:RequestId i:nil="true" />' + '<a:RequestName>AddToQueue</a:RequestName>' + '</d:request>';
    },
    
    serialiseWebApi: function SparkleXrm_Sdk_Messages_AddToQueueRequest$serialiseWebApi() {
        var request = new SparkleXrm.Sdk.Messages.WebAPIOrgnanizationRequestProperties();
        request.OperationType = 'action';
        request.BoundEntityId = this.DestinationQueueId;
        request.BoundEntityLogicalName = 'queue';
        request.RequestName = 'Microsoft.Dynamics.CRM.AddToQueue';
        var target = new SparkleXrm.Sdk.Entity(this.Target.logicalName);
        target.setAttributeValue('activityid', this.Target.id.value);
        request.AdditionalProperties['Target'] = target;
        return request;
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.AddToQueueResponse

SparkleXrm.Sdk.Messages.AddToQueueResponse = function SparkleXrm_Sdk_Messages_AddToQueueResponse(response) {
    if (response == null) {
        return;
    }
    var results = SparkleXrm.Sdk.XmlHelper.selectSingleNode(response, 'Results');
    var $enum1 = ss.IEnumerator.getEnumerator(results.childNodes);
    while ($enum1.moveNext()) {
        var nameValuePair = $enum1.current;
        var key = SparkleXrm.Sdk.XmlHelper.selectSingleNode(nameValuePair, 'key');
        if (SparkleXrm.Sdk.XmlHelper.getNodeTextValue(key) === 'QueueItemId') {
            var value = SparkleXrm.Sdk.XmlHelper.selectSingleNode(nameValuePair, 'value');
            this.QueueItemId = new SparkleXrm.Sdk.Guid(SparkleXrm.Sdk.XmlHelper.getNodeTextValue(value));
        }
    }
}
SparkleXrm.Sdk.Messages.AddToQueueResponse.prototype = {
    QueueItemId: null,
    
    deserialiseWebApi: function SparkleXrm_Sdk_Messages_AddToQueueResponse$deserialiseWebApi(response) {
        this.QueueItemId = new SparkleXrm.Sdk.Guid(response['QueueItemId']);
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.AssignRequest

SparkleXrm.Sdk.Messages.AssignRequest = function SparkleXrm_Sdk_Messages_AssignRequest() {
}
SparkleXrm.Sdk.Messages.AssignRequest.prototype = {
    Target: null,
    Assignee: null,
    
    serialise: function SparkleXrm_Sdk_Messages_AssignRequest$serialise() {
        return '<request i:type="c:AssignRequest" xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts" xmlns:c="http://schemas.microsoft.com/crm/2011/Contracts">' + '        <a:Parameters xmlns:b="http://schemas.datacontract.org/2004/07/System.Collections.Generic">' + '          <a:KeyValuePairOfstringanyType>' + '            <b:key>Target</b:key>' + SparkleXrm.Sdk.Attribute.serialiseValue(this.Target, null) + '          </a:KeyValuePairOfstringanyType>' + '          <a:KeyValuePairOfstringanyType>' + '            <b:key>Assignee</b:key>' + SparkleXrm.Sdk.Attribute.serialiseValue(this.Assignee, null) + '          </a:KeyValuePairOfstringanyType>' + '        </a:Parameters>' + '        <a:RequestId i:nil="true" />' + '        <a:RequestName>Assign</a:RequestName>' + '      </request>';
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.AssignResponse

SparkleXrm.Sdk.Messages.AssignResponse = function SparkleXrm_Sdk_Messages_AssignResponse(response) {
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.BulkDeleteRequest

SparkleXrm.Sdk.Messages.BulkDeleteRequest = function SparkleXrm_Sdk_Messages_BulkDeleteRequest() {
}
SparkleXrm.Sdk.Messages.BulkDeleteRequest.prototype = {
    
    serialise: function SparkleXrm_Sdk_Messages_BulkDeleteRequest$serialise() {
        var recipientsXml = '';
        if (this.ToRecipients != null) {
            var $enum1 = ss.IEnumerator.getEnumerator(this.ToRecipients);
            while ($enum1.moveNext()) {
                var id = $enum1.current;
                recipientsXml += ('<d:guid>' + id.toString() + '</d:guid>');
            }
        }
        var ccRecipientsXml = '';
        if (this.CCRecipients != null) {
            var $enum2 = ss.IEnumerator.getEnumerator(this.CCRecipients);
            while ($enum2.moveNext()) {
                var id = $enum2.current;
                ccRecipientsXml += ('<d:guid>' + id.toString() + '</d:guid>');
            }
        }
        return String.format('<request i:type="b:BulkDeleteRequest" xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts" xmlns:b="http://schemas.microsoft.com/crm/2011/Contracts">' + '        <a:Parameters xmlns:c="http://schemas.datacontract.org/2004/07/System.Collections.Generic">' + '          <a:KeyValuePairOfstringanyType>' + '            <c:key>QuerySet</c:key>' + '            <c:value i:type="a:ArrayOfQueryExpression">' + '              <a:QueryExpression>' + this.QuerySet + '              </a:QueryExpression>' + '            </c:value>' + '          </a:KeyValuePairOfstringanyType>' + '          <a:KeyValuePairOfstringanyType>' + '            <c:key>JobName</c:key>' + '            <c:value i:type="d:string" xmlns:d="http://www.w3.org/2001/XMLSchema">' + this.JobName + '</c:value>' + '          </a:KeyValuePairOfstringanyType>' + '          <a:KeyValuePairOfstringanyType>' + '            <c:key>SendEmailNotification</c:key>' + '            <c:value i:type="d:boolean" xmlns:d="http://www.w3.org/2001/XMLSchema">' + this.SendEmailNotification.toString() + '</c:value>' + '          </a:KeyValuePairOfstringanyType>' + '          <a:KeyValuePairOfstringanyType>' + '            <c:key>ToRecipients</c:key>' + '            <c:value i:type="d:ArrayOfguid" xmlns:d="http://schemas.microsoft.com/2003/10/Serialization/Arrays">' + recipientsXml + '            </c:value>' + '          </a:KeyValuePairOfstringanyType>' + '          <a:KeyValuePairOfstringanyType>' + '            <c:key>CCRecipients</c:key>' + '            <c:value i:type="d:ArrayOfguid" xmlns:d="http://schemas.microsoft.com/2003/10/Serialization/Arrays">' + ccRecipientsXml + '            </c:value>' + '          </a:KeyValuePairOfstringanyType>' + '          <a:KeyValuePairOfstringanyType>' + '            <c:key>RecurrencePattern</c:key>' + '            <c:value i:type="d:string" xmlns:d="http://www.w3.org/2001/XMLSchema" >' + this.RecurrencePattern + '</c:value>' + '          </a:KeyValuePairOfstringanyType>' + '          <a:KeyValuePairOfstringanyType>' + '            <c:key>StartDateTime</c:key>' + '            <c:value i:type="d:dateTime" xmlns:d="http://www.w3.org/2001/XMLSchema">' + SparkleXrm.Sdk.DateTimeEx.toXrmStringUTC(SparkleXrm.Sdk.DateTimeEx.localTimeToUTCFromSettings(this.StartDateTime, SparkleXrm.Sdk.OrganizationServiceProxy.getUserSettings())) + '</c:value>' + '          </a:KeyValuePairOfstringanyType>' + '        </a:Parameters>' + '        <a:RequestId i:nil="true" />' + '        <a:RequestName>BulkDelete</a:RequestName>' + '      </request>');
    },
    
    CCRecipients: null,
    JobName: null,
    QuerySet: null,
    RecurrencePattern: null,
    SendEmailNotification: false,
    SourceImportId: null,
    StartDateTime: null,
    ToRecipients: null
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.BulkDeleteResponse

SparkleXrm.Sdk.Messages.BulkDeleteResponse = function SparkleXrm_Sdk_Messages_BulkDeleteResponse(response) {
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.ExecuteWorkflowRequest

SparkleXrm.Sdk.Messages.ExecuteWorkflowRequest = function SparkleXrm_Sdk_Messages_ExecuteWorkflowRequest() {
}
SparkleXrm.Sdk.Messages.ExecuteWorkflowRequest.prototype = {
    EntityId: null,
    WorkflowId: null,
    
    serialise: function SparkleXrm_Sdk_Messages_ExecuteWorkflowRequest$serialise() {
        return String.format('<request i:type="b:ExecuteWorkflowRequest" xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts" xmlns:b="http://schemas.microsoft.com/crm/2011/Contracts">' + '        <a:Parameters xmlns:c="http://schemas.datacontract.org/2004/07/System.Collections.Generic">' + '          <a:KeyValuePairOfstringanyType>' + '            <c:key>EntityId</c:key>' + '            <c:value i:type="e:guid" xmlns:e="http://schemas.microsoft.com/2003/10/Serialization/">' + this.EntityId + '</c:value>' + '          </a:KeyValuePairOfstringanyType>' + '          <a:KeyValuePairOfstringanyType>' + '            <c:key>WorkflowId</c:key>' + '            <c:value i:type="e:guid" xmlns:e="http://schemas.microsoft.com/2003/10/Serialization/">' + this.WorkflowId + '</c:value>' + '          </a:KeyValuePairOfstringanyType>' + '        </a:Parameters>' + '        <a:RequestId i:nil="true" />' + '        <a:RequestName>ExecuteWorkflow</a:RequestName>' + '      </request>');
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.ExecuteWorkflowResponse

SparkleXrm.Sdk.Messages.ExecuteWorkflowResponse = function SparkleXrm_Sdk_Messages_ExecuteWorkflowResponse(response) {
    var results = SparkleXrm.Sdk.XmlHelper.selectSingleNode(response, 'Results');
    var $enum1 = ss.IEnumerator.getEnumerator(results.childNodes);
    while ($enum1.moveNext()) {
        var nameValuePair = $enum1.current;
        var key = SparkleXrm.Sdk.XmlHelper.selectSingleNode(nameValuePair, 'key');
        if (SparkleXrm.Sdk.XmlHelper.getNodeTextValue(key) === 'Id') {
            var value = SparkleXrm.Sdk.XmlHelper.selectSingleNode(nameValuePair, 'value');
            this.Id = SparkleXrm.Sdk.XmlHelper.getNodeTextValue(value);
        }
    }
}
SparkleXrm.Sdk.Messages.ExecuteWorkflowResponse.prototype = {
    Id: null
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.FetchXmlToQueryExpressionRequest

SparkleXrm.Sdk.Messages.FetchXmlToQueryExpressionRequest = function SparkleXrm_Sdk_Messages_FetchXmlToQueryExpressionRequest() {
}
SparkleXrm.Sdk.Messages.FetchXmlToQueryExpressionRequest.prototype = {
    FetchXml: null,
    
    serialise: function SparkleXrm_Sdk_Messages_FetchXmlToQueryExpressionRequest$serialise() {
        var requestXml = '';
        requestXml += '      <request i:type="b:FetchXmlToQueryExpressionRequest" xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts" xmlns:b="http://schemas.microsoft.com/crm/2011/Contracts">';
        requestXml += '        <a:Parameters xmlns:c="http://schemas.datacontract.org/2004/07/System.Collections.Generic">';
        requestXml += '          <a:KeyValuePairOfstringanyType>';
        requestXml += '            <c:key>FetchXml</c:key>';
        requestXml += '            <c:value i:type="d:string" xmlns:d="http://www.w3.org/2001/XMLSchema">{0}</c:value>';
        requestXml += '          </a:KeyValuePairOfstringanyType>';
        requestXml += '        </a:Parameters>';
        requestXml += '        <a:RequestId i:nil="true" />';
        requestXml += '        <a:RequestName>FetchXmlToQueryExpression</a:RequestName>';
        requestXml += '      </request>';
        return String.format(requestXml, SparkleXrm.Sdk.XmlHelper.encode(this.FetchXml));
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.FetchXmlToQueryExpressionResponse

SparkleXrm.Sdk.Messages.FetchXmlToQueryExpressionResponse = function SparkleXrm_Sdk_Messages_FetchXmlToQueryExpressionResponse(response) {
    var results = SparkleXrm.Sdk.XmlHelper.selectSingleNode(response, 'Results');
    var $enum1 = ss.IEnumerator.getEnumerator(results.childNodes);
    while ($enum1.moveNext()) {
        var nameValuePair = $enum1.current;
        var key = SparkleXrm.Sdk.XmlHelper.selectSingleNode(nameValuePair, 'key');
        if (SparkleXrm.Sdk.XmlHelper.getNodeTextValue(key) === 'Query') {
            var queryNode = SparkleXrm.Sdk.XmlHelper.selectSingleNode(nameValuePair, 'value');
            var queryXml = SparkleXrm.Sdk.XmlHelper.serialiseNode(queryNode).substr(165);
            queryXml = queryXml.substr(0, queryXml.length - 10);
            this.Query = queryXml;
        }
    }
}
SparkleXrm.Sdk.Messages.FetchXmlToQueryExpressionResponse.prototype = {
    Query: null
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.WebAPIOrgnanizationRequestProperties

SparkleXrm.Sdk.Messages.WebAPIOrgnanizationRequestProperties = function SparkleXrm_Sdk_Messages_WebAPIOrgnanizationRequestProperties() {
    this.AdditionalProperties = {};
}
SparkleXrm.Sdk.Messages.WebAPIOrgnanizationRequestProperties.prototype = {
    BoundEntityLogicalName: null,
    BoundEntityId: null,
    RequestName: null,
    OperationType: null,
    CustomImplementation: null
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.RetrieveAllEntitiesRequest

SparkleXrm.Sdk.Messages.RetrieveAllEntitiesRequest = function SparkleXrm_Sdk_Messages_RetrieveAllEntitiesRequest() {
}
SparkleXrm.Sdk.Messages.RetrieveAllEntitiesRequest.prototype = {
    
    serialise: function SparkleXrm_Sdk_Messages_RetrieveAllEntitiesRequest$serialise() {
        return '\r\n                              <request i:type="a:RetrieveAllEntitiesRequest" xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts">\r\n                                <a:Parameters xmlns:b="http://schemas.datacontract.org/2004/07/System.Collections.Generic">\r\n                                  <a:KeyValuePairOfstringanyType>\r\n                                    <b:key>EntityFilters</b:key>\r\n                                    <b:value i:type="c:EntityFilters" xmlns:c="http://schemas.microsoft.com/xrm/2011/Metadata">Entity</b:value>\r\n                                  </a:KeyValuePairOfstringanyType>\r\n                                  <a:KeyValuePairOfstringanyType>\r\n                                    <b:key>RetrieveAsIfPublished</b:key>\r\n                                    <b:value i:type="c:boolean" xmlns:c="http://www.w3.org/2001/XMLSchema">true</b:value>\r\n                                  </a:KeyValuePairOfstringanyType>\r\n                                </a:Parameters>\r\n                                <a:RequestId i:nil="true" />\r\n                                <a:RequestName>RetrieveAllEntities</a:RequestName>\r\n                              </request>\r\n                            ';
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.RetrieveAllEntitiesResponse

SparkleXrm.Sdk.Messages.RetrieveAllEntitiesResponse = function SparkleXrm_Sdk_Messages_RetrieveAllEntitiesResponse(response) {
    var results = SparkleXrm.Sdk.XmlHelper.selectSingleNode(response, 'Results');
    var $enum1 = ss.IEnumerator.getEnumerator(results.childNodes);
    while ($enum1.moveNext()) {
        var nameValuePair = $enum1.current;
        var key = SparkleXrm.Sdk.XmlHelper.selectSingleNode(nameValuePair, 'key');
        if (SparkleXrm.Sdk.XmlHelper.getNodeTextValue(key) === 'EntityMetadata') {
            var values = SparkleXrm.Sdk.XmlHelper.selectSingleNode(nameValuePair, 'value');
            this.EntityMetadata = new Array(values.childNodes.length);
            for (var i = 0; i < values.childNodes.length; i++) {
                var entity = values.childNodes[i];
                var metaData = SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseEntityMetadata({}, entity);
                this.EntityMetadata[i] = metaData;
            }
        }
    }
}
SparkleXrm.Sdk.Messages.RetrieveAllEntitiesResponse.prototype = {
    EntityMetadata: null
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.RetrieveAttributeRequest

SparkleXrm.Sdk.Messages.RetrieveAttributeRequest = function SparkleXrm_Sdk_Messages_RetrieveAttributeRequest() {
}
SparkleXrm.Sdk.Messages.RetrieveAttributeRequest.prototype = {
    EntityLogicalName: null,
    LogicalName: null,
    RetrieveAsIfPublished: false,
    
    serialise: function SparkleXrm_Sdk_Messages_RetrieveAttributeRequest$serialise() {
        return String.format('<request i:type="a:RetrieveAttributeRequest" xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts">' + '<a:Parameters xmlns:b="http://schemas.datacontract.org/2004/07/System.Collections.Generic">' + '<a:KeyValuePairOfstringanyType>' + '<b:key>EntityLogicalName</b:key>' + '<b:value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">{0}</b:value>' + '</a:KeyValuePairOfstringanyType>' + '<a:KeyValuePairOfstringanyType>' + '<b:key>MetadataId</b:key>' + '<b:value i:type="ser:guid"  xmlns:ser="http://schemas.microsoft.com/2003/10/Serialization/">00000000-0000-0000-0000-000000000000</b:value>' + '</a:KeyValuePairOfstringanyType>' + '<a:KeyValuePairOfstringanyType>' + '<b:key>RetrieveAsIfPublished</b:key>' + '<b:value i:type="c:boolean" xmlns:c="http://www.w3.org/2001/XMLSchema">{2}</b:value>' + '</a:KeyValuePairOfstringanyType>' + '<a:KeyValuePairOfstringanyType>' + '<b:key>LogicalName</b:key>' + '<b:value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">{1}</b:value>' + '</a:KeyValuePairOfstringanyType>' + '</a:Parameters>' + '<a:RequestId i:nil="true" />' + '<a:RequestName>RetrieveAttribute</a:RequestName>' + '</request>', this.EntityLogicalName, this.LogicalName, this.RetrieveAsIfPublished);
    },
    
    serialiseWebApi: function SparkleXrm_Sdk_Messages_RetrieveAttributeRequest$serialiseWebApi() {
        var request = new SparkleXrm.Sdk.Messages.WebAPIOrgnanizationRequestProperties();
        request.CustomImplementation = ss.Delegate.create(this, this._customWebApiImplementation);
        return request;
    },
    
    _customWebApiImplementation: function SparkleXrm_Sdk_Messages_RetrieveAttributeRequest$_customWebApiImplementation(request, callback, errorCallback, async) {
        var requestTyped = request;
        var query = String.format("$select=LogicalName&$filter=LogicalName eq '{0}'&$expand=Attributes($filter=LogicalName eq '{1}')", requestTyped.EntityLogicalName, requestTyped.LogicalName);
        var expand = [];
        SparkleXrm.Sdk.WebApiOrganizationServiceProxy._sendRequest('EntityDefinition', 'EntityDefinitions', query, 'GET', null, async, function(state) {
            var data = SparkleXrm.Sdk.WebApiOrganizationServiceProxy._jsonParse(state);
            var value = data['value'];
            var response = new SparkleXrm.Sdk.Messages.RetrieveAttributeResponse(null);
            var entityMetadata = (value[0]);
            response.AttributeMetadata = entityMetadata.Attributes[0];
            if (response.AttributeMetadata.AttributeType === 'Picklist') {
                var resource = String.format('EntityDefinitions({0})/Attributes({1})/Microsoft.Dynamics.CRM.PicklistAttributeMetadata/OptionSet', entityMetadata.MetadataId, response.AttributeMetadata.MetadataId);
                SparkleXrm.Sdk.WebApiOrganizationServiceProxy._sendRequest('Attribute', resource, '$select=Options', 'GET', null, async, function(picklistState) {
                    var picklistdata = SparkleXrm.Sdk.WebApiOrganizationServiceProxy._jsonParse(picklistState);
                    var picklistMetadata = response.AttributeMetadata;
                    picklistMetadata.OptionSet = picklistdata;
                    callback(response);
                }, errorCallback);
            }
            else {
                callback(response);
            }
        }, errorCallback);
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.RetrieveAttributeResponse

SparkleXrm.Sdk.Messages.RetrieveAttributeResponse = function SparkleXrm_Sdk_Messages_RetrieveAttributeResponse(response) {
    if (response == null) {
        return;
    }
    var results = SparkleXrm.Sdk.XmlHelper.selectSingleNode(response, 'Results');
    var metaData = SparkleXrm.Sdk.XmlHelper.selectSingleNode(results.firstChild, 'value');
    var type = SparkleXrm.Sdk.XmlHelper.getAttributeValue(metaData, 'i:type');
    switch (type) {
        case 'c:PicklistAttributeMetadata':
            this.AttributeMetadata = SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialisePicklistAttributeMetadata({}, metaData);
            break;
    }
}
SparkleXrm.Sdk.Messages.RetrieveAttributeResponse.prototype = {
    AttributeMetadata: null
}



////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.RetrieveEntityRequest

SparkleXrm.Sdk.Messages.RetrieveEntityRequest = function SparkleXrm_Sdk_Messages_RetrieveEntityRequest() {
}
SparkleXrm.Sdk.Messages.RetrieveEntityRequest.prototype = {
    EntityFilters: 0,
    LogicalName: null,
    MetadataId: null,
    RetrieveAsIfPublished: false,
    
    serialise: function SparkleXrm_Sdk_Messages_RetrieveEntityRequest$serialise() {
        return '<request i:type="a:RetrieveEntityRequest" xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts">' + '<a:Parameters xmlns:b="http://schemas.datacontract.org/2004/07/System.Collections.Generic">' + '<a:KeyValuePairOfstringanyType>' + '<b:key>EntityFilters</b:key>' + SparkleXrm.Sdk.Attribute.serialiseValue(this.EntityFilters, 'EntityFilters') + '</a:KeyValuePairOfstringanyType>' + '<a:KeyValuePairOfstringanyType>' + '<b:key>MetadataId</b:key>' + SparkleXrm.Sdk.Attribute.serialiseValue(this.MetadataId, null) + '</a:KeyValuePairOfstringanyType>' + '<a:KeyValuePairOfstringanyType>' + '<b:key>RetrieveAsIfPublished</b:key>' + SparkleXrm.Sdk.Attribute.serialiseValue(this.RetrieveAsIfPublished, null) + '</a:KeyValuePairOfstringanyType>' + '<a:KeyValuePairOfstringanyType>' + '<b:key>LogicalName</b:key>' + SparkleXrm.Sdk.Attribute.serialiseValue(this.LogicalName, null) + '</a:KeyValuePairOfstringanyType>' + '</a:Parameters>' + '<a:RequestId i:nil="true" />' + '<a:RequestName>RetrieveEntity</a:RequestName>' + '</request>';
    },
    
    serialiseWebApi: function SparkleXrm_Sdk_Messages_RetrieveEntityRequest$serialiseWebApi() {
        var request = new SparkleXrm.Sdk.Messages.WebAPIOrgnanizationRequestProperties();
        request.CustomImplementation = ss.Delegate.create(this, this._customWebApiImplementation);
        return request;
    },
    
    _customWebApiImplementation: function SparkleXrm_Sdk_Messages_RetrieveEntityRequest$_customWebApiImplementation(request, callback, errorCallback, async) {
        var requestTyped = request;
        var select = 'ActivityTypeMask,AutoRouteToOwnerQueue,CanTriggerWorkflow,Description,DisplayCollectionName,EntityHelpUrlEnabled,EntityHelpUrl,IsDocumentManagementEnabled,IsOneNoteIntegrationEnabled,IsSLAEnabled,IsBPFEntity,IsActivity,IsActivityParty,IsAuditEnabled,IsAvailableOffline,IsChildEntity,IsValidForQueue,IsConnectionsEnabled,IconLargeName,IconMediumName,IconSmallName,IsCustomEntity,IsBusinessProcessEnabled,IsCustomizable,IsDuplicateDetectionEnabled,IsIntersect,IsValidForAdvancedFind,LogicalName,ObjectTypeCode,OwnershipType,PrimaryNameAttribute,PrimaryImageAttribute,PrimaryIdAttribute,SchemaName,EntityColor,LogicalCollectionName,CollectionSchemaName,EntitySetName,MetadataId,HasChanged';
        var query = String.format("$filter=LogicalName eq '{0}'", requestTyped.LogicalName);
        var expand = [];
        if ((requestTyped.EntityFilters & 2) === 4) {
            select += ',Privileges';
        }
        if ((requestTyped.EntityFilters & 2) === 2) {
            expand.add('Attributes($select=AttributeOf,AttributeType,AttributeTypeName,DisplayName,LogicalName,RequiredLevel,SchemaName)');
        }
        if ((requestTyped.EntityFilters & 8) === 8) {
            expand.add('ManyToManyRelationships');
            expand.add('ManyToOneRelationships');
            expand.add('OneToManyRelationships');
        }
        if (expand.length > 0) {
            query += '&$expand=' + expand.join(',');
        }
        SparkleXrm.Sdk.WebApiOrganizationServiceProxy._sendRequest('EntityDefinition', 'EntityDefinitions', query, 'GET', null, async, function(state) {
            var data = SparkleXrm.Sdk.WebApiOrganizationServiceProxy._jsonParse(state);
            var value = data['value'];
            var response = new SparkleXrm.Sdk.Messages.RetrieveEntityResponse(null);
            response.EntityMetadata = value[0];
            callback(response);
        }, errorCallback);
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.RetrieveEntityResponse

SparkleXrm.Sdk.Messages.RetrieveEntityResponse = function SparkleXrm_Sdk_Messages_RetrieveEntityResponse(response) {
    if (response == null) {
        return;
    }
    var results = SparkleXrm.Sdk.XmlHelper.selectSingleNode(response, 'Results');
    var $enum1 = ss.IEnumerator.getEnumerator(results.childNodes);
    while ($enum1.moveNext()) {
        var nameValuePair = $enum1.current;
        var key = SparkleXrm.Sdk.XmlHelper.selectSingleNode(nameValuePair, 'key');
        if (SparkleXrm.Sdk.XmlHelper.getNodeTextValue(key) === 'EntityMetadata') {
            var entity = SparkleXrm.Sdk.XmlHelper.selectSingleNode(nameValuePair, 'value');
            this.EntityMetadata = SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseEntityMetadata({}, entity);
        }
    }
}
SparkleXrm.Sdk.Messages.RetrieveEntityResponse.prototype = {
    EntityMetadata: null
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.RetrieveMetadataChangesRequest

SparkleXrm.Sdk.Messages.RetrieveMetadataChangesRequest = function SparkleXrm_Sdk_Messages_RetrieveMetadataChangesRequest() {
}
SparkleXrm.Sdk.Messages.RetrieveMetadataChangesRequest.prototype = {
    clientVersionStamp: null,
    deletedMetadataFilters: null,
    query: null,
    
    serialise: function SparkleXrm_Sdk_Messages_RetrieveMetadataChangesRequest$serialise() {
        return "<request i:type='a:RetrieveMetadataChangesRequest' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts'>\r\n                <a:Parameters xmlns:b='http://schemas.datacontract.org/2004/07/System.Collections.Generic'>\r\n                  <a:KeyValuePairOfstringanyType>\r\n                    <b:key>ClientVersionStamp</b:key>" + SparkleXrm.Sdk.Attribute.serialiseValue(this.clientVersionStamp, null) + '\r\n                  </a:KeyValuePairOfstringanyType>\r\n                  <a:KeyValuePairOfstringanyType>\r\n                    <b:key>Query</b:key>\r\n                    ' + SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.serialiseEntityQueryExpression(this.query) + "\r\n                  </a:KeyValuePairOfstringanyType>\r\n                </a:Parameters>\r\n                <a:RequestId i:nil='true' />\r\n                <a:RequestName>RetrieveMetadataChanges</a:RequestName>\r\n              </request>";
    },
    
    serialiseWebApi: function SparkleXrm_Sdk_Messages_RetrieveMetadataChangesRequest$serialiseWebApi() {
        var request = new SparkleXrm.Sdk.Messages.WebAPIOrgnanizationRequestProperties();
        request.OperationType = 'functionCall';
        request.RequestName = 'RetrieveMetadataChanges';
        this._replaceCriteriaValues(this.query.Criteria);
        if (this.query.AttributeQuery != null) {
            this._replaceCriteriaValues(this.query.AttributeQuery.Criteria);
        }
        if (this.query.RelationshipQuery != null) {
            this._replaceCriteriaValues(this.query.RelationshipQuery.Criteria);
        }
        request.AdditionalProperties['Query'] = this.query;
        return request;
    },
    
    _replaceCriteriaValues: function SparkleXrm_Sdk_Messages_RetrieveMetadataChangesRequest$_replaceCriteriaValues(criteria) {
        if (criteria != null && criteria.Conditions != null) {
            var $enum1 = ss.IEnumerator.getEnumerator(criteria.Conditions);
            while ($enum1.moveNext()) {
                var expression = $enum1.current;
                if (ss.isUndefined((expression.Value).Type)) {
                    var value = {};
                    value.Value = expression.Value;
                    value.Type = 'System.String';
                    expression.Value = value;
                }
            }
            if (criteria.Filters != null) {
                var $enum2 = ss.IEnumerator.getEnumerator(criteria.Filters);
                while ($enum2.moveNext()) {
                    var filter = $enum2.current;
                    this._replaceCriteriaValues(filter);
                }
            }
        }
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.RetrieveMetadataChangesResponse

SparkleXrm.Sdk.Messages.RetrieveMetadataChangesResponse = function SparkleXrm_Sdk_Messages_RetrieveMetadataChangesResponse(response) {
    if (response == null) {
        return;
    }
    var results = SparkleXrm.Sdk.XmlHelper.selectSingleNode(response, 'Results');
    var $enum1 = ss.IEnumerator.getEnumerator(results.childNodes);
    while ($enum1.moveNext()) {
        var nameValuePair = $enum1.current;
        var key = SparkleXrm.Sdk.XmlHelper.selectSingleNode(nameValuePair, 'key');
        var value = SparkleXrm.Sdk.XmlHelper.selectSingleNode(nameValuePair, 'value');
        switch (SparkleXrm.Sdk.XmlHelper.getNodeTextValue(key)) {
            case 'ServerVersionStamp':
                this.ServerVersionStamp = SparkleXrm.Sdk.XmlHelper.getNodeTextValue(value);
                break;
            case 'DeletedMetadata':
                break;
            case 'EntityMetadata':
                this.EntityMetadata = [];
                for (var i = 0; i < value.childNodes.length; i++) {
                    var entity = value.childNodes[i];
                    var metaData = SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseEntityMetadata({}, entity);
                    this.EntityMetadata.add(metaData);
                }
                break;
        }
    }
}
SparkleXrm.Sdk.Messages.RetrieveMetadataChangesResponse.prototype = {
    EntityMetadata: null,
    ServerVersionStamp: null,
    
    deserialiseWebApi: function SparkleXrm_Sdk_Messages_RetrieveMetadataChangesResponse$deserialiseWebApi(response) {
        this.EntityMetadata = response['EntityMetadata'];
        this.ServerVersionStamp = response['ServerVersionStamp'];
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.RetrieveUserPrivilegesRequest

SparkleXrm.Sdk.Messages.RetrieveUserPrivilegesRequest = function SparkleXrm_Sdk_Messages_RetrieveUserPrivilegesRequest() {
}
SparkleXrm.Sdk.Messages.RetrieveUserPrivilegesRequest.prototype = {
    UserId: null,
    
    serialise: function SparkleXrm_Sdk_Messages_RetrieveUserPrivilegesRequest$serialise() {
        return String.format('<request i:type="b:ExecuteWorkflowRequest" xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts" xmlns:b="http://schemas.microsoft.com/crm/2011/Contracts">' + '        <a:Parameters xmlns:c="http://schemas.datacontract.org/2004/07/System.Collections.Generic">' + '          <a:KeyValuePairOfstringanyType>' + '            <c:key>UserId</c:key>' + '            <c:value i:type="e:guid" xmlns:e="http://schemas.microsoft.com/2003/10/Serialization/">' + this.UserId.value + '</c:value>' + '          </a:KeyValuePairOfstringanyType>' + '        </a:Parameters>' + '        <a:RequestId i:nil="true" />' + '        <a:RequestName>RetrieveUserPrivileges</a:RequestName>' + '      </request>');
    },
    
    serialiseWebApi: function SparkleXrm_Sdk_Messages_RetrieveUserPrivilegesRequest$serialiseWebApi() {
        var request = new SparkleXrm.Sdk.Messages.WebAPIOrgnanizationRequestProperties();
        request.OperationType = 'functionCall';
        request.RequestName = 'Microsoft.Dynamics.CRM.RetrieveUserPrivileges';
        request.BoundEntityId = this.UserId;
        request.BoundEntityLogicalName = 'systemuser';
        return request;
    }
}



////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.WhoAmIRequest

SparkleXrm.Sdk.Messages.WhoAmIRequest = function SparkleXrm_Sdk_Messages_WhoAmIRequest() {
}
SparkleXrm.Sdk.Messages.WhoAmIRequest.prototype = {
    
    serialise: function SparkleXrm_Sdk_Messages_WhoAmIRequest$serialise() {
        return String.format('<request i:type="b:WhoAmIRequest" xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts" xmlns:b="http://schemas.microsoft.com/crm/2011/Contracts">' + '        <a:Parameters xmlns:c="http://schemas.datacontract.org/2004/07/System.Collections.Generic">' + '        </a:Parameters>' + '        <a:RequestId i:nil="true" />' + '        <a:RequestName>WhoAmI</a:RequestName>' + '      </request>');
    },
    
    serialiseWebApi: function SparkleXrm_Sdk_Messages_WhoAmIRequest$serialiseWebApi() {
        var request = new SparkleXrm.Sdk.Messages.WebAPIOrgnanizationRequestProperties();
        request.OperationType = 'functionCall';
        request.RequestName = 'WhoAmI';
        return request;
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.WhoAmIResponse

SparkleXrm.Sdk.Messages.WhoAmIResponse = function SparkleXrm_Sdk_Messages_WhoAmIResponse(response) {
    if (response == null) {
        return;
    }
    var results = SparkleXrm.Sdk.XmlHelper.selectSingleNode(response, 'Results');
    var $enum1 = ss.IEnumerator.getEnumerator(results.childNodes);
    while ($enum1.moveNext()) {
        var nameValuePair = $enum1.current;
        var key = SparkleXrm.Sdk.XmlHelper.selectSingleNode(nameValuePair, 'key');
        var keyName = SparkleXrm.Sdk.XmlHelper.getNodeTextValue(key);
        var valueNode = SparkleXrm.Sdk.XmlHelper.selectSingleNode(nameValuePair, 'value');
        var value = SparkleXrm.Sdk.XmlHelper.getNodeTextValue(valueNode);
        switch (keyName) {
            case 'OrganizationId':
                this.OrganizationId = new SparkleXrm.Sdk.Guid(value);
                break;
            case 'UserId':
                this.UserId = new SparkleXrm.Sdk.Guid(value);
                break;
        }
    }
}
SparkleXrm.Sdk.Messages.WhoAmIResponse.prototype = {
    OrganizationId: null,
    UserId: null,
    
    deserialiseWebApi: function SparkleXrm_Sdk_Messages_WhoAmIResponse$deserialiseWebApi(response) {
        this.OrganizationId = new SparkleXrm.Sdk.Guid(response['OrganizationId']);
        this.UserId = new SparkleXrm.Sdk.Guid(response['UserId']);
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.WinOpportunityRequest

SparkleXrm.Sdk.Messages.WinOpportunityRequest = function SparkleXrm_Sdk_Messages_WinOpportunityRequest() {
}
SparkleXrm.Sdk.Messages.WinOpportunityRequest.prototype = {
    OpportunityClose: null,
    Status: null,
    
    serialise: function SparkleXrm_Sdk_Messages_WinOpportunityRequest$serialise() {
        return '<d:request>' + '<a:Parameters>' + '<a:KeyValuePairOfstringanyType>' + '<b:key>OpportunityClose</b:key>' + ((this.OpportunityClose == null) ? '<b:value i:nil="true" />' : '<b:value i:type="a:Entity">' + this.OpportunityClose.serialise(true) + '</b:value>') + '</a:KeyValuePairOfstringanyType>' + '<a:KeyValuePairOfstringanyType>' + '<b:key>Status</b:key>' + ((this.Status == null) ? '<b:value i:nil="true" />' : '<b:value i:type="a:OptionSetValue"><a:Value>' + this.Status.value.toString() + '</a:Value></b:value>') + '</a:KeyValuePairOfstringanyType>' + '</a:Parameters>' + '<a:RequestId i:nil="true" />' + '<a:RequestName>WinOpportunity</a:RequestName>' + '</d:request>';
    },
    
    serialiseWebApi: function SparkleXrm_Sdk_Messages_WinOpportunityRequest$serialiseWebApi() {
        var request = new SparkleXrm.Sdk.Messages.WebAPIOrgnanizationRequestProperties();
        request.OperationType = 'action';
        request.RequestName = 'WinOpportunity';
        request.AdditionalProperties['OpportunityClose'] = this.OpportunityClose;
        request.AdditionalProperties['Status'] = this.Status;
        return request;
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.WinOpportunityResponse

SparkleXrm.Sdk.Messages.WinOpportunityResponse = function SparkleXrm_Sdk_Messages_WinOpportunityResponse() {
}
SparkleXrm.Sdk.Messages.WinOpportunityResponse.prototype = {
    
    deserialiseWebApi: function SparkleXrm_Sdk_Messages_WinOpportunityResponse$deserialiseWebApi(response) {
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Messages.PagingInfo

SparkleXrm.Sdk.Messages.PagingInfo = function SparkleXrm_Sdk_Messages_PagingInfo() {
}
SparkleXrm.Sdk.Messages.PagingInfo.prototype = {
    Count: 0,
    PageNumber: 0,
    PagingCookie: null,
    ReturnTotalRecordCount: false,
    
    serialise: function SparkleXrm_Sdk_Messages_PagingInfo$serialise() {
        return '<a:Count>' + this.Count.toString() + '</a:Count>' + '<a:PageNumber>' + this.PageNumber.toString() + '</a:PageNumber>' + '<a:PageNumber>' + this.ReturnTotalRecordCount.toString() + '</a:PageNumber>';
    }
}


Type.registerNamespace('SparkleXrm.Sdk.Metadata.Query');

////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Metadata.Query.DeletedMetadataFilters

SparkleXrm.Sdk.Metadata.Query.DeletedMetadataFilters = function() { };
SparkleXrm.Sdk.Metadata.Query.DeletedMetadataFilters.prototype = {
    Default: 'Default', 
    Entity: 'Entity', 
    Attribute: 'Attribute', 
    Relationship: 'Relationship', 
    Label: 'Label', 
    OptionSet: 'OptionSet', 
    All: 'All'
}
SparkleXrm.Sdk.Metadata.Query.DeletedMetadataFilters.registerEnum('SparkleXrm.Sdk.Metadata.Query.DeletedMetadataFilters', false);


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser

SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser = function SparkleXrm_Sdk_Metadata_Query_MetadataSerialiser() {
}
SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseAttributeMetadata = function SparkleXrm_Sdk_Metadata_Query_MetadataSerialiser$deSerialiseAttributeMetadata(item, attribute) {
    var $enum1 = ss.IEnumerator.getEnumerator(attribute.childNodes);
    while ($enum1.moveNext()) {
        var node = $enum1.current;
        var itemValues = item;
        var localName = SparkleXrm.Sdk.XmlHelper.getLocalName(node);
        var fieldName = localName;
        if (node.attributes.length === 1 && node.attributes[0].nodeName === 'i:nil') {
            continue;
        }
        switch (localName) {
            case 'AttributeOf':
            case 'DeprecatedVersion':
            case 'EntityLogicalName':
            case 'LogicalName':
            case 'SchemaName':
            case 'CalculationOf':
                itemValues[fieldName] = SparkleXrm.Sdk.XmlHelper.getNodeTextValue(node);
                break;
            case 'CanBeSecuredForCreate':
            case 'CanBeSecuredForRead':
            case 'CanBeSecuredForUpdate':
            case 'CanModifyAdditionalSettings':
            case 'IsAuditEnabled':
            case 'IsCustomAttribute':
            case 'IsCustomizable':
            case 'IsManaged':
            case 'IsPrimaryId':
            case 'IsPrimaryName':
            case 'IsRenameable':
            case 'IsSecured':
            case 'IsValidForAdvancedFind':
            case 'IsValidForCreate':
            case 'IsValidForRead':
            case 'IsValidForUpdate':
            case 'DefaultValue':
                itemValues[fieldName] = SparkleXrm.Sdk.Attribute.deSerialise(node, 'boolean');
                break;
            case 'ColumnNumber':
            case 'Precision':
            case 'DefaultFormValue':
            case 'MaxLength':
            case 'PrecisionSource':
                itemValues[fieldName] = SparkleXrm.Sdk.Attribute.deSerialise(node, 'int');
                break;
            case 'Description':
            case 'DisplayName':
                var label = {};
                itemValues[fieldName] = SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseLabel(label, node);
                break;
            case 'OptionSet':
                var options = {};
                itemValues[fieldName] = SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseOptionSetMetadata(options, node);
                break;
            case 'AttributeType':
                item.AttributeType = SparkleXrm.Sdk.XmlHelper.getNodeTextValue(node);
                break;
        }
    }
    return item;
}
SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseEntityMetadata = function SparkleXrm_Sdk_Metadata_Query_MetadataSerialiser$deSerialiseEntityMetadata(item, entity) {
    var $enum1 = ss.IEnumerator.getEnumerator(entity.childNodes);
    while ($enum1.moveNext()) {
        var node = $enum1.current;
        var itemValues = item;
        var localName = SparkleXrm.Sdk.XmlHelper.getLocalName(node);
        var fieldName = localName;
        if (node.attributes.length === 1 && node.attributes[0].nodeName === 'i:nil') {
            continue;
        }
        switch (localName) {
            case 'IconLargeName':
            case 'IconMediumName':
            case 'IconSmallName':
            case 'LogicalName':
            case 'PrimaryIdAttribute':
            case 'PrimaryNameAttribute':
            case 'RecurrenceBaseEntityLogicalName':
            case 'ReportViewName':
            case 'SchemaName':
            case 'PrimaryImageAttribute':
                itemValues[fieldName] = SparkleXrm.Sdk.XmlHelper.getNodeTextValue(node);
                break;
            case 'AutoRouteToOwnerQueue':
            case 'CanBeInManyToMany':
            case 'CanBePrimaryEntityInRelationship':
            case 'CanBeRelatedEntityInRelationship':
            case 'CanCreateAttributes':
            case 'CanCreateCharts':
            case 'CanCreateForms':
            case 'CanCreateViews':
            case 'CanModifyAdditionalSettings':
            case 'CanTriggerWorkflow':
            case 'IsActivity':
            case 'IsActivityParty':
            case 'IsAuditEnabled':
            case 'IsAvailableOffline':
            case 'IsChildEntity':
            case 'IsConnectionsEnabled':
            case 'IsCustomEntity':
            case 'IsCustomizable':
            case 'IsDocumentManagementEnabled':
            case 'IsDuplicateDetectionEnabled':
            case 'IsEnabledForCharts':
            case 'IsImportable':
            case 'IsIntersect':
            case 'IsMailMergeEnabled':
            case 'IsManaged':
            case 'IsReadingPaneEnabled':
            case 'IsRenameable':
            case 'IsValidForAdvancedFind':
            case 'IsValidForQueue':
            case 'IsVisibleInMobile':
                itemValues[fieldName] = SparkleXrm.Sdk.Attribute.deSerialise(node, 'boolean');
                break;
            case 'ActivityTypeMask':
            case 'ObjectTypeCode':
                itemValues[fieldName] = SparkleXrm.Sdk.Attribute.deSerialise(node, 'int');
                break;
            case 'Attributes':
                item.Attributes = [];
                var $enum2 = ss.IEnumerator.getEnumerator(node.childNodes);
                while ($enum2.moveNext()) {
                    var childNode = $enum2.current;
                    var a = {};
                    item.Attributes.add(SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseAttributeMetadata(a, childNode));
                }
                break;
            case 'Description':
            case 'DisplayCollectionName':
            case 'DisplayName':
                var label = {};
                itemValues[fieldName] = SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseLabel(label, node);
                break;
        }
    }
    return item;
}
SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseLabel = function SparkleXrm_Sdk_Metadata_Query_MetadataSerialiser$deSerialiseLabel(item, metaData) {
    item.LocalizedLabels = [];
    var labels = SparkleXrm.Sdk.XmlHelper.selectSingleNode(metaData, 'LocalizedLabels');
    if (labels != null && labels.childNodes != null) {
        var $enum1 = ss.IEnumerator.getEnumerator(labels.childNodes);
        while ($enum1.moveNext()) {
            var label = $enum1.current;
            item.LocalizedLabels.add(SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseLocalizedLabel({}, label));
        }
        item.UserLocalizedLabel = SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseLocalizedLabel({}, SparkleXrm.Sdk.XmlHelper.selectSingleNode(metaData, 'UserLocalizedLabel'));
    }
    return item;
}
SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseLocalizedLabel = function SparkleXrm_Sdk_Metadata_Query_MetadataSerialiser$deSerialiseLocalizedLabel(item, metaData) {
    item.Label = SparkleXrm.Sdk.XmlHelper.selectSingleNodeValue(metaData, 'Label');
    item.LanguageCode = parseInt(SparkleXrm.Sdk.XmlHelper.selectSingleNodeValue(metaData, 'LanguageCode'));
    return item;
}
SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.serialiseAttributeQueryExpression = function SparkleXrm_Sdk_Metadata_Query_MetadataSerialiser$serialiseAttributeQueryExpression(item) {
    return SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.serialiseMetadataQueryExpression(item);
}
SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.serialiseEntityQueryExpression = function SparkleXrm_Sdk_Metadata_Query_MetadataSerialiser$serialiseEntityQueryExpression(item) {
    if (item != null) {
        var xml = "<b:value i:type='c:EntityQueryExpression' xmlns:c='http://schemas.microsoft.com/xrm/2011/Metadata/Query'>" + SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.serialiseMetadataQueryExpression(item);
        if (item.AttributeQuery != null) {
            xml += '<c:AttributeQuery>' + SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.serialiseAttributeQueryExpression(item.AttributeQuery) + '</c:AttributeQuery>';
        }
        xml += '<c:LabelQuery>' + SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.serialiseLabelQueryExpression(item.LabelQuery) + "</c:LabelQuery>\r\n                <c:RelationshipQuery i:nil='true' />\r\n                </b:value>";
        return xml;
    }
    else {
        return "<b:value i:nil='true'/>";
    }
}
SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.serialiseLabelQueryExpression = function SparkleXrm_Sdk_Metadata_Query_MetadataSerialiser$serialiseLabelQueryExpression(item) {
    if (item != null) {
        var xml = "<c:FilterLanguages xmlns:d='http://schemas.microsoft.com/2003/10/Serialization/Arrays'>";
        var $enum1 = ss.IEnumerator.getEnumerator(item.FilterLanguages);
        while ($enum1.moveNext()) {
            var lcid = $enum1.current;
            xml = xml + '<d:int>' + lcid.toString() + '</d:int>';
        }
        xml = xml + '</c:FilterLanguages>';
        return xml;
    }
    else {
        return '';
    }
}
SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.serialiseMetadataConditionExpression = function SparkleXrm_Sdk_Metadata_Query_MetadataSerialiser$serialiseMetadataConditionExpression(item) {
    return '<c:MetadataConditionExpression>\r\n                            <c:ConditionOperator>' + item.ConditionOperator + '</c:ConditionOperator>\r\n                            <c:PropertyName>' + item.PropertyName + "</c:PropertyName>\r\n                            <c:Value i:type='d:string' xmlns:d='http://www.w3.org/2001/XMLSchema'>" + item.Value + '</c:Value>\r\n                          </c:MetadataConditionExpression>';
}
SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.serialiseMetadataFilterExpression = function SparkleXrm_Sdk_Metadata_Query_MetadataSerialiser$serialiseMetadataFilterExpression(item) {
    if (item != null) {
        var xml = '<c:Conditions>';
        var $enum1 = ss.IEnumerator.getEnumerator(item.Conditions);
        while ($enum1.moveNext()) {
            var ex = $enum1.current;
            xml += SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.serialiseMetadataConditionExpression(ex);
        }
        xml = xml + '</c:Conditions>\r\n                        <c:FilterOperator>' + item.FilterOperator + '</c:FilterOperator>\r\n                        <c:Filters />';
        return xml;
    }
    return '';
}
SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.serialiseMetadataPropertiesExpression = function SparkleXrm_Sdk_Metadata_Query_MetadataSerialiser$serialiseMetadataPropertiesExpression(item) {
    if (item != null) {
        var xml = '\r\n                <c:AllProperties>' + ((item.AllProperties != null) ? item.AllProperties.toString().toLowerCase() : 'false') + "</c:AllProperties>\r\n                <c:PropertyNames xmlns:d='http://schemas.microsoft.com/2003/10/Serialization/Arrays'>";
        if (item.PropertyNames != null) {
            var $enum1 = ss.IEnumerator.getEnumerator(item.PropertyNames);
            while ($enum1.moveNext()) {
                var value = $enum1.current;
                xml = xml + '<d:string>' + value + '</d:string>';
            }
        }
        xml = xml + '\r\n                </c:PropertyNames>\r\n              ';
        return xml;
    }
    return '';
}
SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.serialiseMetadataQueryExpression = function SparkleXrm_Sdk_Metadata_Query_MetadataSerialiser$serialiseMetadataQueryExpression(item) {
    if (item != null) {
        var xml = '<c:Criteria>' + SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.serialiseMetadataFilterExpression(item.Criteria) + '</c:Criteria>\r\n                    <c:Properties>' + SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.serialiseMetadataPropertiesExpression(item.Properties) + ' </c:Properties>';
        return xml;
    }
    return '';
}
SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseRelationshipMetadata = function SparkleXrm_Sdk_Metadata_Query_MetadataSerialiser$deSerialiseRelationshipMetadata(attribute) {
    var item;
    var type = SparkleXrm.Sdk.XmlHelper.getAttributeValue(attribute, 'i:type');
    switch (type) {
        case 'c:OneToManyRelationshipMetadata':
            item = {};
            break;
        case 'c:ManyToManyRelationshipMetadata':
            item = {};
            break;
        default:
            throw new Error('Unknown relationship type');
    }
    var $enum1 = ss.IEnumerator.getEnumerator(attribute.childNodes);
    while ($enum1.moveNext()) {
        var node = $enum1.current;
        var itemValues = item;
        var localName = SparkleXrm.Sdk.XmlHelper.getLocalName(node);
        var fieldName = localName;
        if (node.attributes.length === 1 && node.attributes[0].nodeName === 'i:nil') {
            continue;
        }
        switch (localName) {
            case 'SchemaName':
            case 'ReferencedAttribute':
            case 'ReferencedEntity':
            case 'ReferencingAttribute':
            case 'ReferencingEntity':
            case 'Entity1IntersectAttribute':
            case 'Entity1LogicalName':
            case 'Entity2IntersectAttribute':
            case 'Entity2LogicalName':
            case 'IntersectEntityName':
                itemValues[fieldName] = SparkleXrm.Sdk.XmlHelper.getNodeTextValue(node);
                break;
            case 'IsCustomRelationship':
            case 'IsManaged':
            case 'IsValidForAdvancedFind':
                itemValues[fieldName] = SparkleXrm.Sdk.Attribute.deSerialise(node, 'boolean');
                break;
            case 'RelationshipType':
                itemValues[fieldName] = SparkleXrm.Sdk.XmlHelper.getNodeTextValue(node);
                break;
        }
    }
    return item;
}
SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseOptionMetadata = function SparkleXrm_Sdk_Metadata_Query_MetadataSerialiser$deSerialiseOptionMetadata(item, metaData) {
    item.Value = parseInt(SparkleXrm.Sdk.XmlHelper.selectSingleNodeValue(metaData, 'Value'));
    item.Label = SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseLabel({}, SparkleXrm.Sdk.XmlHelper.selectSingleNode(metaData, 'Label'));
    return item;
}
SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseOptionSetMetadata = function SparkleXrm_Sdk_Metadata_Query_MetadataSerialiser$deSerialiseOptionSetMetadata(item, metaData) {
    var options = SparkleXrm.Sdk.XmlHelper.selectSingleNode(metaData, 'Options');
    if (options != null) {
        item.Options = [];
        var $enum1 = ss.IEnumerator.getEnumerator(options.childNodes);
        while ($enum1.moveNext()) {
            var option = $enum1.current;
            item.Options.add(SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseOptionMetadata({}, option));
        }
    }
    return item;
}
SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialisePicklistAttributeMetadata = function SparkleXrm_Sdk_Metadata_Query_MetadataSerialiser$deSerialisePicklistAttributeMetadata(item, metaData) {
    var options = SparkleXrm.Sdk.XmlHelper.selectSingleNode(metaData, 'OptionSet');
    if (options != null) {
        item.OptionSet = SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.deSerialiseOptionSetMetadata({}, options);
    }
    return item;
}


Type.registerNamespace('SparkleXrm.Sdk.Metadata');

////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Metadata.AttributeRequiredLevel

SparkleXrm.Sdk.Metadata.AttributeRequiredLevel = function() { };
SparkleXrm.Sdk.Metadata.AttributeRequiredLevel.prototype = {
    None: 'None', 
    SystemRequired: 'SystemRequired', 
    ApplicationRequired: 'ApplicationRequired', 
    Recommended: 'Recommended'
}
SparkleXrm.Sdk.Metadata.AttributeRequiredLevel.registerEnum('SparkleXrm.Sdk.Metadata.AttributeRequiredLevel', false);


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Metadata.AttributeTypeCode

SparkleXrm.Sdk.Metadata.AttributeTypeCode = function() { };
SparkleXrm.Sdk.Metadata.AttributeTypeCode.prototype = {
    Boolean: 'Boolean', 
    Customer: 'Customer', 
    DateTime: 'DateTime', 
    Decimal: 'Decimal', 
    Double: 'Double', 
    Integer: 'Integer', 
    Lookup: 'Lookup', 
    Memo: 'Memo', 
    Money: 'Money', 
    Owner: 'Owner', 
    PartyList: 'PartyList', 
    Picklist: 'Picklist', 
    State: 'State', 
    Status: 'Status', 
    String: 'String', 
    Uniqueidentifier: 'Uniqueidentifier', 
    CalendarRules: 'CalendarRules', 
    Virtual: 'Virtual', 
    BigInt: 'BigInt', 
    ManagedProperty: 'ManagedProperty', 
    EntityName: 'EntityName'
}
SparkleXrm.Sdk.Metadata.AttributeTypeCode.registerEnum('SparkleXrm.Sdk.Metadata.AttributeTypeCode', false);


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Metadata.DateTimeFormat

SparkleXrm.Sdk.Metadata.DateTimeFormat = function() { };
SparkleXrm.Sdk.Metadata.DateTimeFormat.prototype = {
    DateOnly: 'DateOnly', 
    DateAndTime: 'DateAndTime'
}
SparkleXrm.Sdk.Metadata.DateTimeFormat.registerEnum('SparkleXrm.Sdk.Metadata.DateTimeFormat', false);


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Metadata.IntegerFormat

SparkleXrm.Sdk.Metadata.IntegerFormat = function() { };
SparkleXrm.Sdk.Metadata.IntegerFormat.prototype = {
    None: 'None', 
    Duration: 'Duration', 
    TimeZone: 'TimeZone', 
    Language: 'Language', 
    Locale: 'Locale'
}
SparkleXrm.Sdk.Metadata.IntegerFormat.registerEnum('SparkleXrm.Sdk.Metadata.IntegerFormat', false);


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Metadata.OptionSetType

SparkleXrm.Sdk.Metadata.OptionSetType = function() { };
SparkleXrm.Sdk.Metadata.OptionSetType.prototype = {
    Picklist: 'Picklist', 
    State: 'State', 
    Status: 'Status', 
    Boolean: 'Boolean'
}
SparkleXrm.Sdk.Metadata.OptionSetType.registerEnum('SparkleXrm.Sdk.Metadata.OptionSetType', false);


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Metadata.RelationshipType

SparkleXrm.Sdk.Metadata.RelationshipType = function() { };
SparkleXrm.Sdk.Metadata.RelationshipType.prototype = {
    OneToManyRelationship: 'OneToManyRelationship', 
    Default: 'Default', 
    ManyToManyRelationship: 'ManyToManyRelationship'
}
SparkleXrm.Sdk.Metadata.RelationshipType.registerEnum('SparkleXrm.Sdk.Metadata.RelationshipType', false);


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Metadata.StringFormat

SparkleXrm.Sdk.Metadata.StringFormat = function() { };
SparkleXrm.Sdk.Metadata.StringFormat.prototype = {
    Email: 'Email', 
    Text: 'Text', 
    TextArea: 'TextArea', 
    Url: 'Url', 
    TickerSymbol: 'TickerSymbol', 
    PhoneticGuide: 'PhoneticGuide', 
    VersionNumber: 'VersionNumber', 
    Phone: 'Phone'
}
SparkleXrm.Sdk.Metadata.StringFormat.registerEnum('SparkleXrm.Sdk.Metadata.StringFormat', false);


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Metadata.MetadataCache

SparkleXrm.Sdk.Metadata.MetadataCache = function SparkleXrm_Sdk_Metadata_MetadataCache() {
}
SparkleXrm.Sdk.Metadata.MetadataCache.get_entityMetaData = function SparkleXrm_Sdk_Metadata_MetadataCache$get_entityMetaData() {
    return SparkleXrm.Sdk.Metadata.MetadataCache._entityMetaData;
}
SparkleXrm.Sdk.Metadata.MetadataCache.get_attributeMetaData = function SparkleXrm_Sdk_Metadata_MetadataCache$get_attributeMetaData() {
    return SparkleXrm.Sdk.Metadata.MetadataCache._attributeMetaData;
}
SparkleXrm.Sdk.Metadata.MetadataCache.get_optionsetMetaData = function SparkleXrm_Sdk_Metadata_MetadataCache$get_optionsetMetaData() {
    return SparkleXrm.Sdk.Metadata.MetadataCache._optionsCache;
}
SparkleXrm.Sdk.Metadata.MetadataCache.getOptionSetValues = function SparkleXrm_Sdk_Metadata_MetadataCache$getOptionSetValues(entityLogicalName, attributeLogicalName, allowEmpty) {
    if (allowEmpty == null) {
        allowEmpty = false;
    }
    var cacheKey = entityLogicalName + '.' + attributeLogicalName + '.' + allowEmpty.toString();
    if (Object.keyExists(SparkleXrm.Sdk.Metadata.MetadataCache._optionsCache, cacheKey)) {
        return SparkleXrm.Sdk.Metadata.MetadataCache._optionsCache[cacheKey];
    }
    else {
        var attribute = SparkleXrm.Sdk.Metadata.MetadataCache._loadAttributeMetadata(entityLogicalName, attributeLogicalName);
        var pickList = attribute;
        var opts = [];
        if (allowEmpty) {
            opts.add({});
        }
        var $enum1 = ss.IEnumerator.getEnumerator(pickList.OptionSet.Options);
        while ($enum1.moveNext()) {
            var o = $enum1.current;
            var a = {};
            a.name = o.Label.UserLocalizedLabel.Label;
            a.value = o.Value;
            opts.add(a);
        }
        SparkleXrm.Sdk.Metadata.MetadataCache._optionsCache[cacheKey] = opts;
        return opts;
    }
}
SparkleXrm.Sdk.Metadata.MetadataCache.getEntityTypeCodeFromName = function SparkleXrm_Sdk_Metadata_MetadataCache$getEntityTypeCodeFromName(typeName) {
    var entity = SparkleXrm.Sdk.Metadata.MetadataCache._loadEntityMetadata(typeName);
    return entity.ObjectTypeCode;
}
SparkleXrm.Sdk.Metadata.MetadataCache.getSmallIconUrl = function SparkleXrm_Sdk_Metadata_MetadataCache$getSmallIconUrl(typeName) {
    var entity = SparkleXrm.Sdk.Metadata.MetadataCache._loadEntityMetadata(typeName);
    if (entity.IsCustomEntity != null && !!entity.IsCustomEntity) {
        if (entity.IconSmallName != null) {
            return '../../' + entity.IconSmallName;
        }
        else {
            return '../../../../_Common/icon.aspx?cache=1&iconType=NavigationIcon&objectTypeCode=' + entity.ObjectTypeCode.toString();
        }
    }
    else {
        return '/_imgs/ico_16_' + entity.ObjectTypeCode.toString() + '.gif';
    }
}
SparkleXrm.Sdk.Metadata.MetadataCache._loadEntityMetadata = function SparkleXrm_Sdk_Metadata_MetadataCache$_loadEntityMetadata(entityLogicalName) {
    var cacheKey = entityLogicalName;
    var metaData = SparkleXrm.Sdk.Metadata.MetadataCache._entityMetaData[cacheKey];
    if (metaData == null) {
        var request = new SparkleXrm.Sdk.Messages.RetrieveEntityRequest();
        request.EntityFilters = 1;
        request.LogicalName = entityLogicalName;
        request.RetrieveAsIfPublished = true;
        request.MetadataId = new SparkleXrm.Sdk.Guid('00000000-0000-0000-0000-000000000000');
        var response = SparkleXrm.Sdk.OrganizationServiceProxy.execute(request);
        metaData = response.EntityMetadata;
        SparkleXrm.Sdk.Metadata.MetadataCache._entityMetaData[cacheKey] = metaData;
    }
    return metaData;
}
SparkleXrm.Sdk.Metadata.MetadataCache._loadAttributeMetadata = function SparkleXrm_Sdk_Metadata_MetadataCache$_loadAttributeMetadata(entityLogicalName, attributeLogicalName) {
    var cacheKey = entityLogicalName + '|' + attributeLogicalName;
    var metaData = SparkleXrm.Sdk.Metadata.MetadataCache._attributeMetaData[cacheKey];
    if (metaData == null) {
        var request = new SparkleXrm.Sdk.Messages.RetrieveAttributeRequest();
        request.EntityLogicalName = entityLogicalName;
        request.LogicalName = attributeLogicalName;
        request.RetrieveAsIfPublished = true;
        var response = SparkleXrm.Sdk.OrganizationServiceProxy.execute(request);
        metaData = response.AttributeMetadata;
        SparkleXrm.Sdk.Metadata.MetadataCache._attributeMetaData[cacheKey] = metaData;
    }
    return metaData;
}
SparkleXrm.Sdk.Metadata.MetadataCache.AddOptionsetMetadata = function SparkleXrm_Sdk_Metadata_MetadataCache$AddOptionsetMetadata(entityLogicalName, attributeLogicalName, allowEmpty, metatdata) {
    var cacheKey = entityLogicalName + '.' + attributeLogicalName + '.' + allowEmpty.toString();
    var opts = [];
    if (allowEmpty) {
        opts.add({});
    }
    var $enum1 = ss.IEnumerator.getEnumerator(metatdata);
    while ($enum1.moveNext()) {
        var o = $enum1.current;
        var a = {};
        a.name = o['label'];
        a.value = o['value'];
        opts.add(a);
    }
    SparkleXrm.Sdk.Metadata.MetadataCache.get_optionsetMetaData()[cacheKey] = opts;
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Metadata.Query.MetadataConditionOperator

SparkleXrm.Sdk.Metadata.Query.MetadataConditionOperator = function() { };
SparkleXrm.Sdk.Metadata.Query.MetadataConditionOperator.prototype = {
    Equals: 'Equals', 
    NotEquals: 'NotEquals', 
    In: 'In', 
    NotIn: 'NotIn', 
    GreaterThan: 'GreaterThan', 
    LessThan: 'LessThan'
}
SparkleXrm.Sdk.Metadata.Query.MetadataConditionOperator.registerEnum('SparkleXrm.Sdk.Metadata.Query.MetadataConditionOperator', false);


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Metadata.Query.LogicalOperator

SparkleXrm.Sdk.Metadata.Query.LogicalOperator = function() { };
SparkleXrm.Sdk.Metadata.Query.LogicalOperator.prototype = {
    And: 'And', 
    Or: 'Or'
}
SparkleXrm.Sdk.Metadata.Query.LogicalOperator.registerEnum('SparkleXrm.Sdk.Metadata.Query.LogicalOperator', false);


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Metadata.Query.MetadataQueryBuilder

SparkleXrm.Sdk.Metadata.Query.MetadataQueryBuilder = function SparkleXrm_Sdk_Metadata_Query_MetadataQueryBuilder() {
    this.request = new SparkleXrm.Sdk.Messages.RetrieveMetadataChangesRequest();
    this.request.query = {};
    this.request.query.Criteria = {};
    this.request.query.Criteria.FilterOperator = 'Or';
    this.request.query.Criteria.Conditions = [];
}
SparkleXrm.Sdk.Metadata.Query.MetadataQueryBuilder.prototype = {
    request: null,
    
    addEntities: function SparkleXrm_Sdk_Metadata_Query_MetadataQueryBuilder$addEntities(entityLogicalNames, propertiesToReturn) {
        this.request.query.Criteria = {};
        this.request.query.Criteria.FilterOperator = 'Or';
        this.request.query.Criteria.Conditions = [];
        var $enum1 = ss.IEnumerator.getEnumerator(entityLogicalNames);
        while ($enum1.moveNext()) {
            var entity = $enum1.current;
            var condition = {};
            condition.ConditionOperator = 'Equals';
            condition.PropertyName = 'LogicalName';
            condition.Value = entity;
            this.request.query.Criteria.Conditions.add(condition);
        }
        this.request.query.Properties = {};
        this.request.query.Properties.PropertyNames = propertiesToReturn;
    },
    
    addAttributes: function SparkleXrm_Sdk_Metadata_Query_MetadataQueryBuilder$addAttributes(attributeLogicalNames, propertiesToReturn) {
        var attributeQuery = {};
        attributeQuery.Properties = {};
        attributeQuery.Properties.PropertyNames = propertiesToReturn;
        this.request.query.AttributeQuery = attributeQuery;
        var critiera = {};
        attributeQuery.Criteria = critiera;
        critiera.FilterOperator = 'Or';
        critiera.Conditions = [];
        var $enum1 = ss.IEnumerator.getEnumerator(attributeLogicalNames);
        while ($enum1.moveNext()) {
            var attribute = $enum1.current;
            var condition = {};
            condition.PropertyName = 'LogicalName';
            condition.ConditionOperator = 'Equals';
            condition.Value = attribute;
            critiera.Conditions.add(condition);
        }
    },
    
    setLanguage: function SparkleXrm_Sdk_Metadata_Query_MetadataQueryBuilder$setLanguage(lcid) {
        this.request.query.LabelQuery = {};
        this.request.query.LabelQuery.FilterLanguages = [];
        this.request.query.LabelQuery.FilterLanguages.add(lcid);
    }
}


Type.registerNamespace('SparkleXrm.Sdk.Ribbon');

////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Ribbon.RibbonButton

SparkleXrm.Sdk.Ribbon.RibbonButton = function SparkleXrm_Sdk_Ribbon_RibbonButton(Id, Sequence, LabelText, Command, Image16, Image32) {
    SparkleXrm.Sdk.Ribbon.RibbonButton.initializeBase(this, [ Id, Sequence, LabelText, Command, Image16, Image32 ]);
}
SparkleXrm.Sdk.Ribbon.RibbonButton.prototype = {
    
    serialiseToRibbonXml: function SparkleXrm_Sdk_Ribbon_RibbonButton$serialiseToRibbonXml(sb) {
        sb.appendLine('<Button Id="' + SparkleXrm.Sdk.XmlHelper.encode(this.Id) + '" LabelText="' + SparkleXrm.Sdk.XmlHelper.encode(this.LabelText) + '" Sequence="' + this.Sequence.toString() + '" Command="' + SparkleXrm.Sdk.XmlHelper.encode(this.Command) + '"' + ((this.Image32by32 != null) ? (' Image32by32="' + SparkleXrm.Sdk.XmlHelper.encode(this.Image32by32) + '"') : '') + ((this.Image16by16 != null) ? (' Image16by16="' + SparkleXrm.Sdk.XmlHelper.encode(this.Image16by16) + '"') : '') + ' />');
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Ribbon.RibbonControl

SparkleXrm.Sdk.Ribbon.RibbonControl = function SparkleXrm_Sdk_Ribbon_RibbonControl(Id, Sequence, LabelText, Command, Image16, Image32) {
    this.Id = Id;
    this.Sequence = Sequence;
    this.LabelText = LabelText;
    this.Command = Command;
    this.Image16by16 = Image16;
    this.Image32by32 = Image32;
}
SparkleXrm.Sdk.Ribbon.RibbonControl.prototype = {
    Id: null,
    LabelText: null,
    Sequence: 0,
    Command: null,
    Image16by16: null,
    Image32by32: null,
    
    serialiseToRibbonXml: function SparkleXrm_Sdk_Ribbon_RibbonControl$serialiseToRibbonXml(sb) {
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Ribbon.RibbonFlyoutAnchor

SparkleXrm.Sdk.Ribbon.RibbonFlyoutAnchor = function SparkleXrm_Sdk_Ribbon_RibbonFlyoutAnchor(Id, Sequence, LabelText, Command, Image16, Image32) {
    SparkleXrm.Sdk.Ribbon.RibbonFlyoutAnchor.initializeBase(this, [ Id, Sequence, LabelText, Command, Image16, Image32 ]);
}
SparkleXrm.Sdk.Ribbon.RibbonFlyoutAnchor.prototype = {
    menu: null,
    
    serialiseToRibbonXml: function SparkleXrm_Sdk_Ribbon_RibbonFlyoutAnchor$serialiseToRibbonXml(sb) {
        sb.appendLine('<FlyoutAnchor Id="' + SparkleXrm.Sdk.XmlHelper.encode(this.Id) + '" LabelText="' + SparkleXrm.Sdk.XmlHelper.encode(this.LabelText) + '" Sequence="' + this.Sequence.toString() + '" Command="' + SparkleXrm.Sdk.XmlHelper.encode(this.Command) + '"' + ((this.Image32by32 != null) ? (' Image32by32="' + SparkleXrm.Sdk.XmlHelper.encode(this.Image32by32) + '"') : '') + ((this.Image16by16 != null) ? (' Image16by16="' + SparkleXrm.Sdk.XmlHelper.encode(this.Image16by16) + '"') : '') + ' PopulateDynamically="false">');
        sb.appendLine(this.menu.serialiseToRibbonXml());
        sb.appendLine('</FlyoutAnchor>');
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Ribbon.RibbonMenu

SparkleXrm.Sdk.Ribbon.RibbonMenu = function SparkleXrm_Sdk_Ribbon_RibbonMenu(Id) {
    this.sections = [];
    this.Id = Id;
}
SparkleXrm.Sdk.Ribbon.RibbonMenu.prototype = {
    Id: null,
    
    serialiseToRibbonXml: function SparkleXrm_Sdk_Ribbon_RibbonMenu$serialiseToRibbonXml() {
        var sb = new ss.StringBuilder();
        sb.appendLine('<Menu Id="' + this.Id + '">');
        var $enum1 = ss.IEnumerator.getEnumerator(this.sections);
        while ($enum1.moveNext()) {
            var section = $enum1.current;
            section.serialiseToRibbonXml(sb);
        }
        sb.appendLine('</Menu>');
        return sb.toString();
    },
    
    addSection: function SparkleXrm_Sdk_Ribbon_RibbonMenu$addSection(section) {
        SparkleXrm.ArrayEx.add(this.sections, section);
        return this;
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Sdk.Ribbon.RibbonMenuSection

SparkleXrm.Sdk.Ribbon.RibbonMenuSection = function SparkleXrm_Sdk_Ribbon_RibbonMenuSection(Id, LabelText, Sequence, DisplayMode) {
    this.buttons = [];
    this.Id = Id;
    this.Title = LabelText;
    this.Sequence = Sequence;
    this.DisplayMode = DisplayMode;
}
SparkleXrm.Sdk.Ribbon.RibbonMenuSection.prototype = {
    Id: null,
    Title: null,
    Sequence: 0,
    DisplayMode: null,
    
    serialiseToRibbonXml: function SparkleXrm_Sdk_Ribbon_RibbonMenuSection$serialiseToRibbonXml(sb) {
        sb.appendLine('<MenuSection Id="' + SparkleXrm.Sdk.XmlHelper.encode(this.Id) + ((this.Title != null) ? '" Title="' + this.Title : '') + '" Sequence="' + this.Sequence.toString() + '" DisplayMode="' + this.DisplayMode + '">');
        sb.appendLine('<Controls Id="' + SparkleXrm.Sdk.XmlHelper.encode(this.Id + '.Controls') + '">');
        var $enum1 = ss.IEnumerator.getEnumerator(this.buttons);
        while ($enum1.moveNext()) {
            var button = $enum1.current;
            button.serialiseToRibbonXml(sb);
        }
        sb.appendLine('</Controls>');
        sb.appendLine('</MenuSection>');
    },
    
    addButton: function SparkleXrm_Sdk_Ribbon_RibbonMenuSection$addButton(button) {
        SparkleXrm.ArrayEx.add(this.buttons, button);
        return this;
    }
}


Type.registerNamespace('SparkleXrm.Services');

////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Services.CachedOrganizationService

SparkleXrm.Services.CachedOrganizationService = function SparkleXrm_Services_CachedOrganizationService() {
}
SparkleXrm.Services.CachedOrganizationService.retrieve = function SparkleXrm_Services_CachedOrganizationService$retrieve(entityName, entityId, attributesList) {
    var result = SparkleXrm.Services.CachedOrganizationService.cache.get(entityName, entityId);
    if (result == null) {
        result = SparkleXrm.Sdk.OrganizationServiceProxy.retrieve(entityName, entityId, attributesList);
        SparkleXrm.Services.CachedOrganizationService.cache.insert(entityName, entityId, result);
        return result;
    }
    else {
        return result;
    }
}
SparkleXrm.Services.CachedOrganizationService.retrieveMultiple = function SparkleXrm_Services_CachedOrganizationService$retrieveMultiple(fetchXml) {
    var result = SparkleXrm.Services.CachedOrganizationService.cache.get('query', fetchXml);
    if (result == null) {
        result = SparkleXrm.Sdk.OrganizationServiceProxy.retrieveMultiple(fetchXml);
        SparkleXrm.Services.CachedOrganizationService.cache.insert('query', fetchXml, result);
        return result;
    }
    else {
        return result;
    }
}


////////////////////////////////////////////////////////////////////////////////
// SparkleXrm.Services.OrganizationServiceCache

SparkleXrm.Services.OrganizationServiceCache = function SparkleXrm_Services_OrganizationServiceCache() {
    this._innerCache = {};
}
SparkleXrm.Services.OrganizationServiceCache.prototype = {
    
    remove: function SparkleXrm_Services_OrganizationServiceCache$remove(entityName, id) {
    },
    
    insert: function SparkleXrm_Services_OrganizationServiceCache$insert(key, query, results) {
        this._innerCache[key + '_' + query] = results;
    },
    
    get: function SparkleXrm_Services_OrganizationServiceCache$get(key, query) {
        return this._innerCache[key + '_' + query];
    }
}


SparkleXrm.ArrayEx.registerClass('SparkleXrm.ArrayEx');
SparkleXrm.DelegateItterator.registerClass('SparkleXrm.DelegateItterator');
SparkleXrm.NumberEx.registerClass('SparkleXrm.NumberEx');
SparkleXrm.Xrm.PageEx.registerClass('SparkleXrm.Xrm.PageEx');
SparkleXrm.StringEx.registerClass('SparkleXrm.StringEx');
SparkleXrm.TaskIterrator.registerClass('SparkleXrm.TaskIterrator');
SparkleXrm.Sdk.ColumnSet.registerClass('SparkleXrm.Sdk.ColumnSet');
SparkleXrm.Sdk.Attribute.registerClass('SparkleXrm.Sdk.Attribute');
SparkleXrm.Sdk.AttributeTypes.registerClass('SparkleXrm.Sdk.AttributeTypes');
SparkleXrm.Sdk.Entity.registerClass('SparkleXrm.Sdk.Entity', null, SparkleXrm.ComponentModel.INotifyPropertyChanged);
SparkleXrm.Sdk.OrganizationSettings.registerClass('SparkleXrm.Sdk.OrganizationSettings', SparkleXrm.Sdk.Entity);
SparkleXrm.Sdk.UserSettingsAttributes.registerClass('SparkleXrm.Sdk.UserSettingsAttributes');
SparkleXrm.Sdk.UserSettings.registerClass('SparkleXrm.Sdk.UserSettings', SparkleXrm.Sdk.Entity);
SparkleXrm.Sdk.DataCollectionOfEntity.registerClass('SparkleXrm.Sdk.DataCollectionOfEntity', null, ss.IEnumerable);
SparkleXrm.Sdk.DateTimeEx.registerClass('SparkleXrm.Sdk.DateTimeEx');
SparkleXrm.Sdk.EntityCollection.registerClass('SparkleXrm.Sdk.EntityCollection');
SparkleXrm.Sdk.EntityReference.registerClass('SparkleXrm.Sdk.EntityReference');
SparkleXrm.Sdk.Guid.registerClass('SparkleXrm.Sdk.Guid');
SparkleXrm.Sdk.Money.registerClass('SparkleXrm.Sdk.Money');
SparkleXrm.Sdk.OptionSetValue.registerClass('SparkleXrm.Sdk.OptionSetValue');
SparkleXrm.Sdk.OrganizationServiceProxy.registerClass('SparkleXrm.Sdk.OrganizationServiceProxy');
SparkleXrm.Sdk.XrmService.registerClass('SparkleXrm.Sdk.XrmService');
SparkleXrm.Sdk.Relationship.registerClass('SparkleXrm.Sdk.Relationship');
SparkleXrm.Sdk.RetrieveRelationshipRequest.registerClass('SparkleXrm.Sdk.RetrieveRelationshipRequest', null, Object, Object);
SparkleXrm.Sdk.RetrieveRelationshipResponse.registerClass('SparkleXrm.Sdk.RetrieveRelationshipResponse', null, Object);
SparkleXrm.Sdk.WebApiRequestResponse.registerClass('SparkleXrm.Sdk.WebApiRequestResponse');
SparkleXrm.Sdk.WebApiOrganizationServiceProxy.registerClass('SparkleXrm.Sdk.WebApiOrganizationServiceProxy', null, SparkleXrm.Sdk.IOrganizationService);
SparkleXrm.Sdk.XmlHelper.registerClass('SparkleXrm.Sdk.XmlHelper');
SparkleXrm.Sdk.Messages.AddToQueueRequest.registerClass('SparkleXrm.Sdk.Messages.AddToQueueRequest', null, Object, Object);
SparkleXrm.Sdk.Messages.AddToQueueResponse.registerClass('SparkleXrm.Sdk.Messages.AddToQueueResponse', null, Object);
SparkleXrm.Sdk.Messages.AssignRequest.registerClass('SparkleXrm.Sdk.Messages.AssignRequest', null, Object);
SparkleXrm.Sdk.Messages.AssignResponse.registerClass('SparkleXrm.Sdk.Messages.AssignResponse', null, Object);
SparkleXrm.Sdk.Messages.BulkDeleteRequest.registerClass('SparkleXrm.Sdk.Messages.BulkDeleteRequest', null, Object);
SparkleXrm.Sdk.Messages.BulkDeleteResponse.registerClass('SparkleXrm.Sdk.Messages.BulkDeleteResponse', null, Object);
SparkleXrm.Sdk.Messages.ExecuteWorkflowRequest.registerClass('SparkleXrm.Sdk.Messages.ExecuteWorkflowRequest', null, Object);
SparkleXrm.Sdk.Messages.ExecuteWorkflowResponse.registerClass('SparkleXrm.Sdk.Messages.ExecuteWorkflowResponse', null, Object);
SparkleXrm.Sdk.Messages.FetchXmlToQueryExpressionRequest.registerClass('SparkleXrm.Sdk.Messages.FetchXmlToQueryExpressionRequest', null, Object);
SparkleXrm.Sdk.Messages.FetchXmlToQueryExpressionResponse.registerClass('SparkleXrm.Sdk.Messages.FetchXmlToQueryExpressionResponse', null, Object);
SparkleXrm.Sdk.Messages.WebAPIOrgnanizationRequestProperties.registerClass('SparkleXrm.Sdk.Messages.WebAPIOrgnanizationRequestProperties');
SparkleXrm.Sdk.Messages.RetrieveAllEntitiesRequest.registerClass('SparkleXrm.Sdk.Messages.RetrieveAllEntitiesRequest', null, Object);
SparkleXrm.Sdk.Messages.RetrieveAllEntitiesResponse.registerClass('SparkleXrm.Sdk.Messages.RetrieveAllEntitiesResponse', null, Object);
SparkleXrm.Sdk.Messages.RetrieveAttributeRequest.registerClass('SparkleXrm.Sdk.Messages.RetrieveAttributeRequest', null, Object, Object);
SparkleXrm.Sdk.Messages.RetrieveAttributeResponse.registerClass('SparkleXrm.Sdk.Messages.RetrieveAttributeResponse', null, Object);
SparkleXrm.Sdk.Messages.RetrieveEntityRequest.registerClass('SparkleXrm.Sdk.Messages.RetrieveEntityRequest', null, Object, Object);
SparkleXrm.Sdk.Messages.RetrieveEntityResponse.registerClass('SparkleXrm.Sdk.Messages.RetrieveEntityResponse', null, Object);
SparkleXrm.Sdk.Messages.RetrieveMetadataChangesRequest.registerClass('SparkleXrm.Sdk.Messages.RetrieveMetadataChangesRequest', null, Object, Object);
SparkleXrm.Sdk.Messages.RetrieveMetadataChangesResponse.registerClass('SparkleXrm.Sdk.Messages.RetrieveMetadataChangesResponse', null, Object, Object);
SparkleXrm.Sdk.Messages.WhoAmIRequest.registerClass('SparkleXrm.Sdk.Messages.WhoAmIRequest', null, Object, Object);
SparkleXrm.Sdk.Messages.WhoAmIResponse.registerClass('SparkleXrm.Sdk.Messages.WhoAmIResponse', null, Object, Object);
SparkleXrm.Sdk.Messages.WinOpportunityRequest.registerClass('SparkleXrm.Sdk.Messages.WinOpportunityRequest', null, Object, Object);
SparkleXrm.Sdk.Messages.WinOpportunityResponse.registerClass('SparkleXrm.Sdk.Messages.WinOpportunityResponse', null, Object);
SparkleXrm.Sdk.Messages.PagingInfo.registerClass('SparkleXrm.Sdk.Messages.PagingInfo');
SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser.registerClass('SparkleXrm.Sdk.Metadata.Query.MetadataSerialiser');
SparkleXrm.Sdk.Metadata.MetadataCache.registerClass('SparkleXrm.Sdk.Metadata.MetadataCache');
SparkleXrm.Sdk.Metadata.Query.MetadataQueryBuilder.registerClass('SparkleXrm.Sdk.Metadata.Query.MetadataQueryBuilder');
SparkleXrm.Sdk.Ribbon.RibbonControl.registerClass('SparkleXrm.Sdk.Ribbon.RibbonControl');
SparkleXrm.Sdk.Ribbon.RibbonButton.registerClass('SparkleXrm.Sdk.Ribbon.RibbonButton', SparkleXrm.Sdk.Ribbon.RibbonControl);
SparkleXrm.Sdk.Ribbon.RibbonFlyoutAnchor.registerClass('SparkleXrm.Sdk.Ribbon.RibbonFlyoutAnchor', SparkleXrm.Sdk.Ribbon.RibbonControl);
SparkleXrm.Sdk.Ribbon.RibbonMenu.registerClass('SparkleXrm.Sdk.Ribbon.RibbonMenu');
SparkleXrm.Sdk.Ribbon.RibbonMenuSection.registerClass('SparkleXrm.Sdk.Ribbon.RibbonMenuSection');
SparkleXrm.Services.CachedOrganizationService.registerClass('SparkleXrm.Services.CachedOrganizationService');
SparkleXrm.Services.OrganizationServiceCache.registerClass('SparkleXrm.Services.OrganizationServiceCache');
SparkleXrm.Xrm.PageEx.majorVersion = 0;
(function () {
    SparkleXrm.Xrm.PageEx.majorVersion = 2013;
})();
SparkleXrm.Sdk.AttributeTypes.string_ = 'string';
SparkleXrm.Sdk.AttributeTypes.decimal_ = 'decimal';
SparkleXrm.Sdk.AttributeTypes.int_ = 'int';
SparkleXrm.Sdk.AttributeTypes.double_ = 'double';
SparkleXrm.Sdk.AttributeTypes.dateTime_ = 'dateTime';
SparkleXrm.Sdk.AttributeTypes.boolean_ = 'boolean';
SparkleXrm.Sdk.AttributeTypes.entityReference = 'EntityReference';
SparkleXrm.Sdk.AttributeTypes.guid_ = 'guid';
SparkleXrm.Sdk.AttributeTypes.optionSetValue = 'OptionSetValue';
SparkleXrm.Sdk.AttributeTypes.aliasedValue = 'AliasedValue';
SparkleXrm.Sdk.AttributeTypes.entityCollection = 'EntityCollection';
SparkleXrm.Sdk.AttributeTypes.money = 'Money';
SparkleXrm.Sdk.OrganizationSettings.entityLogicalName = 'organization';
SparkleXrm.Sdk.UserSettingsAttributes.userSettingsId = 'usersettingsid';
SparkleXrm.Sdk.UserSettingsAttributes.businessUnitId = 'businessunitid';
SparkleXrm.Sdk.UserSettingsAttributes.calendarType = 'calendartype';
SparkleXrm.Sdk.UserSettingsAttributes.currencyDecimalPrecision = 'currencydecimalprecision';
SparkleXrm.Sdk.UserSettingsAttributes.currencyFormatCode = 'currencyformatcode';
SparkleXrm.Sdk.UserSettingsAttributes.currencySymbol = 'currencysymbol';
SparkleXrm.Sdk.UserSettingsAttributes.dateFormatCode = 'dateformatcode';
SparkleXrm.Sdk.UserSettingsAttributes.dateFormatString = 'dateformatstring';
SparkleXrm.Sdk.UserSettingsAttributes.dateSeparator = 'dateseparator';
SparkleXrm.Sdk.UserSettingsAttributes.decimalSymbol = 'decimalsymbol';
SparkleXrm.Sdk.UserSettingsAttributes.defaultCalendarView = 'defaultcalendarview';
SparkleXrm.Sdk.UserSettingsAttributes.defaultDashboardId = 'defaultdashboardid';
SparkleXrm.Sdk.UserSettingsAttributes.localeId = 'localeid';
SparkleXrm.Sdk.UserSettingsAttributes.longDateFormatCode = 'longdateformatcode';
SparkleXrm.Sdk.UserSettingsAttributes.negativeCurrencyFormatCode = 'negativecurrencyformatcode';
SparkleXrm.Sdk.UserSettingsAttributes.negativeFormatCode = 'negativeformatcode';
SparkleXrm.Sdk.UserSettingsAttributes.numberGroupFormat = 'numbergroupformat';
SparkleXrm.Sdk.UserSettingsAttributes.numberSeparator = 'numberseparator';
SparkleXrm.Sdk.UserSettingsAttributes.offlineSyncInterval = 'offlinesyncinterval';
SparkleXrm.Sdk.UserSettingsAttributes.pricingDecimalPrecision = 'pricingdecimalprecision';
SparkleXrm.Sdk.UserSettingsAttributes.showWeekNumber = 'showweeknumber';
SparkleXrm.Sdk.UserSettingsAttributes.systemUserId = 'systemuserid';
SparkleXrm.Sdk.UserSettingsAttributes.timeFormatCodestring = 'timeformatcodestring';
SparkleXrm.Sdk.UserSettingsAttributes.timeFormatString = 'timeformatstring';
SparkleXrm.Sdk.UserSettingsAttributes.timeSeparator = 'timeseparator';
SparkleXrm.Sdk.UserSettingsAttributes.timeZoneBias = 'timezonebias';
SparkleXrm.Sdk.UserSettingsAttributes.timeZoneCode = 'timezonecode';
SparkleXrm.Sdk.UserSettingsAttributes.timeZoneDaylightBias = 'timezonedaylightbias';
SparkleXrm.Sdk.UserSettingsAttributes.timeZoneDaylightDay = 'timezonedaylightday';
SparkleXrm.Sdk.UserSettingsAttributes.timeZoneDaylightDayOfWeek = 'timezonedaylightdayofweek';
SparkleXrm.Sdk.UserSettingsAttributes.timeZoneDaylightHour = 'timezonedaylighthour';
SparkleXrm.Sdk.UserSettingsAttributes.timeZoneDaylightMinute = 'timezonedaylightminute';
SparkleXrm.Sdk.UserSettingsAttributes.timeZoneDaylightMonth = 'timezonedaylightmonth';
SparkleXrm.Sdk.UserSettingsAttributes.timeZoneDaylightSecond = 'timezonedaylightsecond';
SparkleXrm.Sdk.UserSettingsAttributes.timeZoneDaylightYear = 'timezonedaylightyear';
SparkleXrm.Sdk.UserSettingsAttributes.timeZoneStandardBias = 'timezonestandardbias';
SparkleXrm.Sdk.UserSettingsAttributes.timeZoneStandardDay = 'timezonestandardday';
SparkleXrm.Sdk.UserSettingsAttributes.timeZoneStandardDayOfWeek = 'timezonestandarddayofweek';
SparkleXrm.Sdk.UserSettingsAttributes.timeZoneStandardHour = 'timezonestandardhour';
SparkleXrm.Sdk.UserSettingsAttributes.timeZoneStandardMinute = 'timezonestandardminute';
SparkleXrm.Sdk.UserSettingsAttributes.timeZoneStandardMonth = 'timezonestandardmonth';
SparkleXrm.Sdk.UserSettingsAttributes.timeZoneStandardSecond = 'timezonestandardsecond';
SparkleXrm.Sdk.UserSettingsAttributes.timeZoneStandardYear = 'timezonestandardyear';
SparkleXrm.Sdk.UserSettingsAttributes.transactionCurrencyId = 'transactioncurrencyid';
SparkleXrm.Sdk.UserSettingsAttributes.uiLanguageId = 'uilanguageid';
SparkleXrm.Sdk.UserSettingsAttributes.workdayStartTime = 'workdaystarttime';
SparkleXrm.Sdk.UserSettingsAttributes.workdayStopTime = 'workdaystoptime';
SparkleXrm.Sdk.UserSettings.entityLogicalName = 'usersettings';
SparkleXrm.Sdk.Guid.empty = new SparkleXrm.Sdk.Guid('00000000-0000-0000-0000-000000000000');
SparkleXrm.Sdk.OrganizationServiceProxy.userSettings = null;
SparkleXrm.Sdk.OrganizationServiceProxy.organizationSettings = null;
SparkleXrm.Sdk.OrganizationServiceProxy._service = null;
(function () {
    SparkleXrm.Sdk.OrganizationServiceProxy._service = new SparkleXrm.Sdk.WebApiOrganizationServiceProxy();
})();
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._clientUrl = null;
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._webAPIVersion = '8.2';
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._partyListAttributes = [ 'bcc', 'cc', 'customers', 'from', 'optionalattendees', 'organizer', 'partners', 'requiredattendees', 'resources', 'to' ];
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._navigationToLogicalNameMapping = {};
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._logicalNameToNavigationMapping = {};
SparkleXrm.Sdk.WebApiOrganizationServiceProxy._webApiMetadata = {};
(function () {
    SparkleXrm.Sdk.WebApiOrganizationServiceProxy.addMetadata('contact', 'contacts', 'contactid');
    SparkleXrm.Sdk.WebApiOrganizationServiceProxy.addMetadata('account', 'accounts', 'accountid');
    SparkleXrm.Sdk.WebApiOrganizationServiceProxy.addMetadata('systemuser', 'systemusers', 'systemuserid');
    SparkleXrm.Sdk.WebApiOrganizationServiceProxy.addMetadata('activityparty', 'activityparties', 'activitypartyid');
})();
SparkleXrm.Sdk.XmlHelper._encode_map = { '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;', "'": '&#39;' };
SparkleXrm.Sdk.XmlHelper._decode_map = { '&amp;': '&', '&quot;': '"', '&lt;': '<', '&gt;': '>', '&#39;': "'" };
SparkleXrm.Sdk.Metadata.MetadataCache._attributeMetaData = {};
SparkleXrm.Sdk.Metadata.MetadataCache._entityMetaData = {};
SparkleXrm.Sdk.Metadata.MetadataCache._optionsCache = {};
SparkleXrm.Services.CachedOrganizationService.cache = new SparkleXrm.Services.OrganizationServiceCache();
});

