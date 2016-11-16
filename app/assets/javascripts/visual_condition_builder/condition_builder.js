(function ($) {

    $.conditionBuilder = function(element, options) {
        var defaults = {
            placeholder: {
                operators: 'Select a operator...',
                values: 'Enter a value...'
            },
            dictionary: [],
            values: [],
            input: '',
            debug: false,
            numericConfig: {
                aSep: '',
                aDec: '.',
                aSign: ''
            },
            select2Config: {
                theme: "bootstrap",
                width: 'auto',
                placeholder: '',
                allowClear: false,
                dropdownAutoWidth: 'true',
                tags: false
            }
        };

        var plugin = this;
        var $element = $(element), element = element;
        var jsonCache = {};
        plugin.parameters = {};
        plugin.result = function(data){};

        $element.addClass('condition-builder');

        //~~~ PUBLIC
        plugin.add_condition = function (field_name) {
            var fieldObj = getFieldByName(field_name);
            if (typeof fieldObj !== 'object') {
                return;
            }
            var $frameConditions = getFrameConditions($element);

            //BLOCK ELEMENTS HTML
            var block = $('<div class="group-conditions clearfix"></div>');
            block.append('<span class="box-shadow-menu"></span>');
            block.append('<input type="hidden" class="field form-control" value="' + fieldObj.field + '" data-type="' + fieldObj.type + '" />');
            block.append('<span class="field_name label label-info">' + fieldObj.label + ' <a href="" class="remove-condition">&#10006;</a></span>');
            block.append('<select class="operators hide form-control"></select>');
            block.append('<input class="fixed_operator hide form-control disabled" disabled />');
            block.append('<select class="values hide form-control"></select>');
            block.append('<input class="fixed_value hide form-control" />');
            if (plugin.parameters.debug == true) {
                block.append('<p class="expression help-block"></p>');
            }
            $elField = block.find('.field');
            $elOperators = block.find('.operators, .fixed_operator');
            $elValues = block.find('.values, .fixed_value');

            //EVENTS
            block.find('.remove-condition').on('click', event_remove_condition);
            $elOperators.on('change', event_load_values);

            $frameConditions.append(block);
            $frameConditions.trigger('change');

            //LOAD OPERATORS
            plugin.load_operators($elField);

            return block;

        }; //END add_condition

        plugin.clear_rows = function () {
            if (confirm('Essa ação removerá todos os itens. Deseja continuar?') == true) {
                var $frameConditions = getFrameConditions();
                $frameConditions.find('.group-conditions').remove();
            }
        };

        plugin.load_operators = function (fieldEl) {
            var $fieldElement = $(fieldEl);
            var field_name = $fieldElement.val();
            var field = getFieldByName(field_name);
            var $groupConditions = $fieldElement.closest('.group-conditions');
            var $operators = $groupConditions.find('.operators');
            var $fixedOperator = $groupConditions.find('.fixed_operator');
            var $values = $groupConditions.find('.values');
            var $fixedValue = $groupConditions.find('.fixed_value');
            var operators = field.operators;

            remove_plugins_elements($groupConditions);
            $operators.html('').addClass('hide');
            $fixedOperator.val('').addClass('hide');
            $values.html('').addClass('hide');
            $fixedValue.val('').addClass('hide');

            operators = normalize_operators(operators);
            if (operators != undefined && operators.length > 1) {
                $.each(operators, function (op_i, op_el) {
                    var op_option = $('<option data-index="' + op_i + '" data-no-value="' + op_el.no_value + '" data-multiple="' + op_el.multiple + '" value="' + op_el.operator + '">' + getLabel(op_el) + '</option>');
                    $operators.append(op_option);
                });
                $operators.removeClass('hide');
                $operators.trigger('change');
            } else if (operators != undefined && operators.length == 1) {
                $fixedOperator.attr('data-index', 0).attr('data-multiple', operators[0].multiple).attr('data-no-value', operators[0].no_value);
                $fixedOperator.val(operators[0].operator).removeClass('hide').trigger('change');
            }
        };

        plugin.fill_condition = function (groupConditions, data) {
            if (data != undefined && data.length > 0 && groupConditions != undefined) {
                $elOperators = getOperatorElement(groupConditions);
                $elOperators.val(data[1]).trigger('change');

                $elOperator = $elOperators.find('option:selected');
                var multiple = $elOperator.attr('data-multiple');

                $elValues = getValueElement(groupConditions);
                if ($elValues.length > 1) {
                    var values = (typeof data[2] == 'string') ? [data[2]] : data[2];
                    $.each($elValues, function (i, elValue) {
                        $(elValue).val(values[i]);
                    });
                } else if (multiple == 'true' || $elValues.attr('data-ajax-values') !== undefined) {
                    var values = (typeof data[2] == 'string') ? [data[2]] : data[2];
                    if (values != undefined) {
                        $.each(values, function (i, value) {
                            if ($elValues.find('option[value="' + value + '"]').length <= 0) {
                                $elValues.append('<option value="' + value + '">' + value + '</option>');
                            }
                        });
                        $elValues.val(values).trigger('change');
                    }
                } else {
                    $elValues.val(data[2]);
                }
                $elValues.trigger('change');
            }
        }; //END fill_condition

        plugin.load_values = function (values) {
            $frameConditions = getFrameConditions();
            if (typeof values == 'string') {
                plugin.parameters.values = getJson(values);
            } else if (is_blank(values) && !is_blank(plugin.parameters.input)) {
                if ($(plugin.parameters.input).length > 0) {
                    plugin.parameters.values = JSON.parse($(plugin.parameters.input).val());
                }
            } else {
                plugin.parameters.values = values;
            }
            build_rows();
        }; //END load_values

        plugin.load_values_from_input = function (element_input) {
            var $elInput = $(element_input);
            if ($elInput.length > 0) {
                plugin.parameters.values = JSON.parse($elInput.val());
            }
            plugin.load_values(plugin.parameters.values);
        }; //END load_values_from_input

        plugin.getResult = function () {
            var data = [];
            $element.find('.group-conditions').each(function (i, groupConditions) {
                var field_name = getFieldValue(groupConditions);
                var operator = getOperator(groupConditions);
                if (field_name != undefined && field_name != '' && operator != undefined && operator != '') {
                    data.push([field_name, operator, getValue(groupConditions)])
                }
            });
            if (typeof plugin.result === 'function') {
                plugin.result(data); //CB
            }
            if (!is_blank(plugin.parameters.input)) {
                $(plugin.parameters.input).val(JSON.stringify(data));
            }
            return data;
        }; //END getResult;

        //~~~ PRIVATE
        var getFieldByName = function (field_name) {
            var f = $.map(plugin.parameters.dictionary, function (h, i) {
                if (h.field == field_name) {
                    return h;
                }
            });
            if (jQuery.isArray(f)) {
                f = f[0];
            }
            return f;
        }; //END getFieldByName

        var getLabel = function (obj) {
            if (!is_blank(obj.label)) {
                return String(obj.label);
            } else {
                return '';
            }
        };

        var groupLabel = function (obj) {
            if (obj.group !== undefined) {
                var label = (typeof obj.group === 'object') ? obj.group[Object.keys(obj.group)[0]] : obj.group;
                return String(label);
            } else {
                return '';
            }
        }; //END groupLabel

        var getFrameConditions = function (el) {
            if (el == undefined) {
                return $element.find('.conditions:first');
            } else if ($(el).hasClass('conditions')) {
                return $(el);
            } else {
                return $(el).find('.conditions:first');
            }
        }; //END getFrameConditions

        var getFieldElement = function (groupConditions) {
            return $(groupConditions).find('.field:input');
        }; //END getFieldElement

        var getFieldValue = function (groupConditions) {
            return getFieldElement(groupConditions).val();
        }; //END getFieldValue

        var getOperatorElement = function (groupConditions) {
            var element = $(groupConditions).find('.operators');
            if (element.hasClass('hide')) {
                element = $(groupConditions).find('.fixed_operator');
            }
            return element;
        }; //END getOperatorElement

        var getOperator = function (groupConditions) {
            var operator = getOperatorElement(groupConditions).val();
            if (is_blank(operator)) {
                operator = ''
            }
            return operator;
        }; //END getOperator

        var getValueElement = function (groupConditions) {
            var element = $(groupConditions).find('.values');
            if (element.hasClass('hide')) {
                element = $(groupConditions).find('.fixed_value');
            }
            return element;
        }; //END getValues

        var getValue = function (groupConditions) {
            var values = getValueElement(groupConditions);
            var value = [];
            var op_el = getOperatorElement(groupConditions);
            if (op_el.hasClass('operators')) {
                op_el = op_el.find('option:selected');
            }
            if (op_el != undefined && op_el.length > 0 && op_el.attr('data-no-value') == 'false') {
                $.each(values, function (i, elValue) {
                    value.push($(elValue).val());
                });
            }
            return normalize_values(value);
        }; //END getValue

        var normalize_values = function (values) {
            // if (typeof values=='string') {values = [values]}
            if (typeof values == 'object') {
                if (typeof values[0] == 'object') {
                    values = flatten(values);
                }
                $.each(values, function (i, v) {
                    if (is_blank(v)) {
                        values[i] = ''
                    }
                });
            }
            if (typeof values[0] == 'string' && values.length == 1) {
                values = values[0];
            }
            if (is_blank(values)) {
                values = ''
            }
            return values;
        }; //END normalize_values

        var event_remove_condition = function (ev) {
            ev.preventDefault();
            $(this).closest('.group-conditions').remove();
            $element.find('.conditions').trigger('change');
        }; //END event_remove_condition

        var event_load_values = function (ev) {
            var $groupConditions = $(this).closest('.group-conditions');
            var field_name = $groupConditions.find('.field').val();
            var field = getFieldByName(field_name);
            var op_el = $(this).hasClass('operators') ? $(this).find('option:selected') : $(this);
            var values = field.values;
            build_values(op_el, values);
        }; //END event_load_values

        var event_build_expression = function (ev) {
            if (plugin.parameters.debug == true) {
                var $groupConditions = $(this).closest('.group-conditions');
                var index = $groupConditions.attr('data-index');
                var $expression = $groupConditions.find('.expression');
                var $field = getFieldValue($groupConditions);
                var $operator = getOperator($groupConditions);
                var $value = getValue($groupConditions);
                $expression.html($field + ' ' + $operator + ' ' + $value);
            }
            plugin.getResult();
        }; //END event_build_expression

        var build_rows = function () {
            $element.find('.conditions').html('');
            if (plugin.parameters.values.length > 0) {
                $.each(plugin.parameters.values, function (i, data) {
                    var field = data[0];
                    var groupConditions = plugin.add_condition(field);
                    plugin.fill_condition(groupConditions, data);
                });
            }
        };

        var build_values = function (op_el, values) {
            var $groupConditions = $(op_el).closest('.group-conditions');
            var no_value = op_el.attr('data-no-value');
            var $values = $groupConditions.find('.values');
            var $fixedValue = $groupConditions.find('.fixed_value');
            var multiple = op_el.attr('data-multiple');
            multiple = (multiple == 'true' ? 'true' : 'false');
            $values.html('').removeAttr('data-ajax-values').addClass('hide');
            $fixedValue.removeAttr('data-ajax-values').addClass('hide');

            if (typeof values === 'string') {
                $values.attr('data-ajax-values', values);
                $fixedValue.attr('data-ajax-values', values);
                values = [''];
            }

            var list_with_item = (values != undefined && values.length > 0);

            if (no_value == 'false') {
                if (list_with_item) {
                    $.each(values, function (val_i, val_el) {
                        if (typeof val_el == 'object') {
                            var _id = val_el.id;
                            var _label = getLabel(val_el);
                            if (is_blank(_label)) {
                                _label = _id;
                            }
                        } else {
                            var _id = val_el;
                            var _label = _id;
                        }
                        $values.append('<option data-index="' + val_i + '" value="' + _id + '">' + _label + '</option>');
                    });
                    $values.removeClass('hide');
                    $values.trigger('change');
                } else {
                    if (multiple == 'true') {
                        $values.removeClass('hide');
                        $values.trigger('change');
                    } else {
                        $fixedValue.removeClass('hide');
                        $fixedValue.trigger('change');
                    }
                }
            }

            validate_multiple_values($groupConditions);
            normalize_values_type($groupConditions, list_with_item, multiple);
        }; //END build_values

        var validate_multiple_values = function (groupConditions) {
            var $groupConditions = $(groupConditions);
            var $operatorEl = getOperatorElement($groupConditions);
            var $valueEl = getValueElement($groupConditions);
            if ($operatorEl.hasClass('operators')) {
                $operatorEl = $operatorEl.find('option:selected');
            }
            var multiple = $operatorEl.attr('data-multiple');
            remove_plugins_elements(groupConditions);
            if (!isNaN(multiple)) {
                for (var i = 1; i < parseInt(multiple); i++) {
                    var $valueElClone = $valueEl.clone();
                    $valueElClone.addClass('clone').removeClass('hide');
                    $valueElClone.insertAfter($valueEl);
                }
            } else {
                $valueEl.attr('multiple', multiple == 'true');
            }
            $valueEl.attr('multiple', multiple == 'true');
        }; //END validate_multiple_values

        var remove_plugins_elements = function (groupConditions) {
            $groupConditions = $(groupConditions);
            $groupConditions.find('.fixed_value[class*="select2-"], .values[class*="select2-"]').select2('destroy');
            $groupConditions.find('.values.clone, .fixed_value.clone').remove();
        }; //END remove_plugins_elements

        var normalize_values_type = function (groupConditions, list_with_item, multiple) {
            var $groupConditions = $(groupConditions);
            var $fieldEl = getFieldElement($groupConditions);
            var $valueEl = getValueElement($groupConditions);
            var uTypeField = $fieldEl.attr('data-type'); //.toUpperCase();
            var field = $fieldEl.val();

            $.each($valueEl, function (i, el) {
                var $el = $(el);

                //RESET ELEMENT
                $el.autoNumeric('destroy');
                // $element.tooltip('destroy');
                if (plugin.parameters.debug == true) {
                    $el.parent().find('.type_field').remove();
                }

                //VALIDATE TYPE
                switch (true) {
                    case /^DATE$/.test(uTypeField):
                        $el.attr('type', 'date');
                        break;
                    case /^TIME$/.test(uTypeField):
                        $el.attr('type', 'time');
                        break;
                    case /^DATETIME$/.test(uTypeField):
                        $el.attr('type', 'datetime');
                        break;
                    case /^NUMBER/.test(uTypeField):
                    case /^DECIMAL/.test(uTypeField):
                        $el.attr('type', 'text');
                        var decimal_places = uTypeField.match(/\(([0-9]+)\)$/);
                        if (decimal_places == undefined || decimal_places == null) {
                            decimal_places = /Vl[A-Z]/.test(field) == true ? 2 : 4;
                        } else {
                            decimal_places = decimal_places[1];
                        }
                        $el.autoNumeric("init", plugin.parameters.numericConfig);
                        $el.autoNumeric("update", {mDec: decimal_places});
                        window.setTimeout(function () {
                            if ($el.autoNumeric('getSettings') != undefined) {
                                $el.trigger('blur'); //FORCE REFRESH
                            }
                        }, 500);
                        // $element.tooltip({
                        //     placement: 'top',
                        //     title: 'Use DOT as decimal separator',
                        //     trigger: 'hover focus active'
                        // });
                        break;
                    case /^INTEGER$/.test(uTypeField):
                        $el.attr('type', 'number');
                        break;
                    case /^STRING$/.test(uTypeField):
                    default:
                        $el.attr('type', 'text');
                        break;
                }
                if (plugin.parameters.debug == true) {
                    console.log(field, uTypeField);
                    $el.parent().append('<i class="type_field" style="font-size: 10px; color: #ccc;"><br>' + uTypeField + '</i>');
                }
                if (($el.hasClass('values') && !$el.hasClass('hide'))) {
                    // build_select2_element($el, (!list_with_item && multiple == 'true'));
                    build_select2_element($el);
                }
            });
        }; //END normalize_values_type

        var normalize_operators = function (operators) {
            if (operators != undefined && typeof operators == 'object' && operators.length > 0) {
                $.each(operators, function (i, row) {
                    var label = getLabel(row);
                    if (is_blank(label)) {
                        operators[i].label = row.operator;
                    }
                    if (is_blank(row.multiple)) {
                        operators[i].multiple = 'false';
                    }
                    if (is_blank(row.no_value)) {
                        operators[i].no_value = 'false';
                    }
                });
            }
            return operators;
        }; //END normalize_operators

        var is_blank = function (value) {
            return (value === undefined || value === null || value === [] || value === '')
        }; //END is_blank

        var flatten = function (arrays) {
            return [].concat.apply([], arrays);
        }; //END flatten

        var getJson = function (url, force, cb) {
            if (force == undefined || force == null) {
                force = false;
            }
            if (force == true) {
                jsonCache[url] = undefined;
            }
            if (jsonCache[url] == undefined) {
                $.ajax({
                    url: url,
                    async: false,
                    dataType: 'json',
                    success: function (dates) {
                        jsonCache[url] = dates;
                        if (cb != undefined && typeof cb == 'function') {
                            cb(dates)
                        }
                        ;
                    }, errorr: function (errorr) {
                        alert("Could not load url " + url);
                    }
                });
            }
            return jsonCache[url];
        }; //END getJson

        var build_select2_element = function (el, tags) {
            if (tags == undefined) tags = true;
            var $el = $(el);
            var select2Config = plugin.parameters.select2Config;
            var ajax_url = $el.attr('data-ajax-values');
            if (ajax_url != undefined) {
                $.extend(select2Config, {
                    ajax: {
                        url: ajax_url,
                        dataType: 'json',
                        delay: 250,
                        data: function (params) {
                            return {
                                q: params.term, // search term
                                page: params.page
                            };
                        },
                        processResults: function (data, params) {
                            return {
                                results: $.map(data, function (item) {
                                    return {
                                        text: getLabel(item),
                                        id: item.id
                                    }
                                })
                            };
                        },
                        cache: true
                    }
                });
            }

            var totalItems = $el.find('option').length;
            if ($el.hasClass('operators')) {
                $.extend(select2Config, {placeholder: plugin.parameters.placeholder.operators});
            }
            if ($el.hasClass('values')) {
                $.extend(select2Config, {placeholder: plugin.parameters.placeholder.values});
            }

            if (tags == true) {
                $.extend(select2Config, {tags: true, tokenSeparators: [',', ';', ' ']});
            }

            $.fn.select2.defaults.set("theme", (select2Config.theme || 'bootstrap'));
            var select2El = $el.select2(select2Config);
            var select2DefaultValue = (totalItems == 1 ? $el.find('option:first').val() : null);
            select2El.val(select2DefaultValue).trigger("change"); //FORCE RESET DO SET PLACEHOLDER
        };

        plugin.init = function() {
            plugin.parameters = $.extend(true, defaults, options);

            //~~~ INIT
            $element.append('<div class="conditions"></div>');
            $element.on('change', '.conditions, .operators, .values, .fixed_value', event_build_expression);

            if (typeof plugin.parameters.dictionary == 'string') {
                plugin.parameters.dictionary = getJson(plugin.parameters.dictionary);
            }

            if (!is_blank(plugin.parameters.input)) {
                plugin.load_values_from_input(plugin.parameters.input);
                $(document).on('change', plugin.parameters.input, function (ev) {
                    plugin.load_values_from_input(plugin.parameters.input);
                });
            } else {
                plugin.load_values(plugin.parameters.values);
            }
        };

        plugin.init();
    };

    $.fn.conditionBuilder = function (options) {
        return this.each(function() {
            if (undefined == $(this).data('conditionBuilder')) {
                var plugin = new $.conditionBuilder(this, options);
                $(this).data('conditionBuilder', plugin);
            }
        });
    };
})
(jQuery);

$(document).on('click', '.add-condition-field', function (ev) {
    ev.preventDefault();
    var container = $(this).closest('.add-condition').attr('data-target');
    var field_name = $(this).attr('data-field');
    var $conditionBuilder = $(container).data('conditionBuilder');
    $conditionBuilder.add_condition(field_name);
});