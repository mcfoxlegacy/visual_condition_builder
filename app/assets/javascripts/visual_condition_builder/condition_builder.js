jQuery.fn.conditionBuilder = function (options) {

    var defaults = {
        allowBlank: true,
        placeholder: {
            fields: 'Select a item...',
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
        },
        jsFnCallback: '',
        result: function(){}
    };

    var parameters = $.extend(true, defaults, options);
    var jsonCache = {};

    var $conditionBuilder = $(this);
    $conditionBuilder.addClass('condition-builder');

    //~~~ PUBLIC
    $conditionBuilder.add_condition = function (previous_element_index) {

        var $frameConditions = getFrameConditions();

        var next_index = $frameConditions.find('.group-conditions').length;

        //BLOCK ELEMENTS HTML
        var block = $('<div class="group-conditions clearfix" data-index="' + next_index + '"></div>');
        block.append('<select id="fields_' + next_index + '" class="fields form-control"></select>');
        block.append('<select id="operators_' + next_index + '" class="operators hide form-control"></select>');
        block.append('<input id="fixed_operator_' + next_index + '" class="fixed_operator hide form-control disabled" disabled />');
        block.append('<select id="values_' + next_index + '" class="values hide form-control"></select>');
        block.append('<input id="fixed_value_' + next_index + '" class="fixed_value hide form-control" />');
        block.append('<a href="" class="btn btn-default remove-condition" data-index="' + next_index + '">-</a>');
        //<i class="glyphicon glyphicon-minus"></i>
        block.append('<a href="" class="btn btn-default add-condition" data-index="' + next_index + '">+</a>');
        //<i class="glyphicon glyphicon-plus"></i>
        if (parameters.debug == true) {
            block.append('<p class="expression help-block"></p>');
        }
        $elFields = block.find('.fields');
        $elOperators = block.find('.operators, .fixed_operator');
        $elValues = block.find('.values, .fixed_value');

        //EVENTS
        block.find('.remove-condition').on('click', event_remove_condition);
        block.find('.add-condition').on('click', event_add_condition);
        $elFields.on('change', event_load_operators);
        $elOperators.on('change', event_load_values);

        //LOAD FIELDS
        load_fields($elFields);

        //ADD BLOCK HTML+EVENTS NO HTML DE VALUES
        var previous_element = $frameConditions.find('.group-conditions[data-index="' + (previous_element_index) + '"]');
        if (previous_element != undefined && previous_element.length > 0) {
            previous_element.after(block);
        } else {
            $frameConditions.append(block);
        }

        $conditionBuilder.find('.conditions').trigger('change');

        return block;

    }; //END add_condition

    $conditionBuilder.clear_rows = function() {
        if (confirm('Essa ação removerá todos os itens. Deseja continuar?')==true) {
            var $frameConditions = getFrameConditions();
            $frameConditions.find('.group-conditions').remove();
            $conditionBuilder.add_condition();
        }
    }

    $conditionBuilder.fill_condition = function (groupConditions, data) {

        if (data != undefined && data.length > 0 && groupConditions != undefined) {
            $elFields = getFieldElement(groupConditions);
            $elFields.val(data[0]).trigger('change');
            if ($elFields.val()!=data[0]) {
                $elFields.parent().append('<i class="field_error text-danger"><br>Field '+data[0]+' não existe na lista! Por favor ajuste >>> '+data.join(' '));
                return;
            }
            $elFields.trigger('change');

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
            } else if (multiple == 'true' || $elValues.attr('data-ajax-values')!==undefined) {
                var values = (typeof data[2] == 'string') ? [data[2]] : data[2];
                if (values != undefined) {
                    $.each(values, function (i, value) {
                        if ($elValues.find('option[value="'+value+'"]').length <= 0) {
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

    $conditionBuilder.load_values = function (values) {
        $frameConditions = getFrameConditions();
        if (typeof values == 'string') {
            parameters.values = getJson(values);
        } else if (is_blank(values) && !is_blank(parameters.input)) {
            if ($(parameters.input).length > 0) {
                parameters.values = JSON.parse($(parameters.input).val());
            }
        }
        build_rows();
    }; //END load_values

    $conditionBuilder.load_values_from_input = function (element_input) {
        var $elInput = $(element_input);
        if ($elInput.length > 0) {
            parameters.values = JSON.parse($elInput.val());
        }
        $conditionBuilder.load_values(parameters.values);
    }; //END load_values_from_input

    $conditionBuilder.getResult = function () {
        var data = [];
        $conditionBuilder.find('.group-conditions').each(function (i, groupConditions) {
            var field = getField(groupConditions);
            var operator = getOperator(groupConditions);
            if (field!=undefined && field!='' && operator!=undefined && operator!='') {
                data.push([field, operator, getValue(groupConditions)])
            }
        });
        if (!is_blank(parameters.jsFnCallback) && typeof window[parameters.jsFnCallback] === 'function') {
            window[parameters.jsFnCallback](data); //CB
        }
        if (typeof parameters.result === 'function') {
            parameters.result(data); //CB
        }
        if (!is_blank(parameters.input)) {
            $(parameters.input).val(JSON.stringify(data));
        }
        return data;
    }; //END getResult;

    //~~~ PRIVATE
    var getDates = function (index) {
        return index == undefined ? parameters.dictionary : parameters.dictionary[index];
    }; //END getDates

    var getLabel = function(obj) {
        if (!is_blank(obj.label)) {
            return String(obj.label);
        } else {
            return '';
        }
    };

    var groupLabel = function(obj) {
        if (obj.group!==undefined) {
            var label = (typeof obj.group === 'object') ? obj.group[Object.keys(obj.group)[0]] : obj.group;
            return String(label);
        } else {
            return '';
        }
    }; //END groupLabel

    var getFrameConditions = function (element) {
        if (element == undefined) {
            return $conditionBuilder.find('.conditions:first');
        } else if ($(element).hasClass('conditions')) {
            return $(element);
        } else {
            return $(element).find('.conditions:first');
        }
    }

    var getFieldElement = function (groupConditions) {
        return $(groupConditions).find('.fields');
    }; //END getFieldElement

    var getField = function (groupConditions) {
        return getFieldElement(groupConditions).find('option:selected').val();
    }; //END getField

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
        $conditionBuilder.find('.conditions').trigger('change');
    }; //END event_remove_condition

    var event_add_condition = function (ev) {
        ev.preventDefault();
        var index = $(this).attr('data-index');
        if (parameters.debug == true) {
            console.log('Adding condition after index ' + index);
        }
        $conditionBuilder.add_condition(index);
    }; //END event_add_condition

    var event_load_operators = function (ev) {
        var $groupConditions = $(this).closest('.group-conditions');
        var index = $groupConditions.find('.fields option:selected').attr('data-index');
        var $operators = $groupConditions.find('.operators');
        var $fixedOperator = $groupConditions.find('.fixed_operator');
        var $values = $groupConditions.find('.values');
        var $fixedValue = $groupConditions.find('.fixed_value');
        var operators = getDates(index).operators;

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

    }; //END event_load_operators

    var event_load_values = function (ev) {
        var $groupConditions = $(this).closest('.group-conditions');
        var index = $groupConditions.find('.fields option:selected').attr('data-index');
        var op_el = $(this).hasClass('operators') ? $(this).find('option:selected') : $(this);
        var values = getDates(index).values;
        build_values(op_el, values);
    }; //END event_load_values

    var event_build_expression = function (ev) {
        if (parameters.debug == true) {
            var $groupConditions = $(this).closest('.group-conditions');
            var index = $groupConditions.attr('data-index');
            var $expression = $groupConditions.find('.expression');
            var $field = getField($groupConditions);
            var $operator = getOperator($groupConditions);
            var $value = getValue($groupConditions);
            $expression.html($field + ' ' + $operator + ' ' + $value);
        }
        $conditionBuilder.getResult();
    }; //END event_build_expression

    var event_validate_buttons = function (ev) {
        if ($conditionBuilder.find('.conditions .group-conditions').length == 1) {
            $conditionBuilder.find('.conditions .remove-condition').hide();
        } else if ($conditionBuilder.find('.conditions .group-conditions').length == 2) {
            $conditionBuilder.find('.conditions .remove-condition').show();
        }
    }

    var load_fields = function (elFields) {
        var datas = getDates();
        datas.sort(order_by_group_and_label);
        $.each(datas, function (i, data) {
            var label = getLabel(data);
            var group = groupLabel(data); 
            if (is_blank(data.type)) {
                data.type = 'string';
            }
            if (!is_blank(group)) {label = group + ' - ' + label;}
            $elFields.append('<option data-index="' + i + '" data-type="' + data.type + '" value="' + data.field + '">' + label + '</option>');
        });
        if (parameters.allowBlank == true) {
            $elFields.prepend('<option value=""></option>').val('');
        } else {
            elFields.trigger('change');
        }
        build_select2_element(elFields);
    }; //END LOAD_FIELDS

    var build_rows = function () {
        $conditionBuilder.find('.conditions').html('');
        if (parameters.values.length > 0) {
            $.each(parameters.values, function (i, data) {
                var groupConditions = $conditionBuilder.add_condition();
                $conditionBuilder.fill_condition(groupConditions, data);
            });
        } else {
            $conditionBuilder.add_condition();
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
        formata_type_values($groupConditions, list_with_item, multiple);

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

    var formata_type_values = function (groupConditions, list_with_item, multiple) {
        var $groupConditions = $(groupConditions);
        var $fieldElOpt = getFieldElement($groupConditions).find('option:selected');
        var $valueEl = getValueElement($groupConditions);
        var uTypeField = $fieldElOpt.attr('data-type').toUpperCase();
        var field = $fieldElOpt.val();
        
        $.each($valueEl, function (i, element) {
            var $element = $(element);

            //RESET ELEMENT
            $element.autoNumeric('destroy');
            // $element.tooltip('destroy');
            if (parameters.debug == true) { $element.parent().find('.type_field').remove(); }

            //VALIDATE TYPE
            switch (true) {
                case /^DATE$/.test(uTypeField):
                    $element.attr('type', 'date');
                    break;
                case /^TIME$/.test(uTypeField):
                    $element.attr('type', 'time');
                    break;
                case /^DATETIME$/.test(uTypeField):
                    $element.attr('type', 'datetime');
                    break;
                case /^NUMBER/.test(uTypeField):
                case /^DECIMAL/.test(uTypeField):
                    $element.attr('type', 'text');
                    var decimal_places = uTypeField.match(/\(([0-9]+)\)$/);
                    if (decimal_places==undefined || decimal_places==null) {
                        decimal_places = /Vl[A-Z]/.test(field)==true ? 2 : 4;
                    } else {
                        decimal_places = decimal_places[1];
                    }
                    $element.autoNumeric("init", parameters.numericConfig);
                    $element.autoNumeric("update", {mDec: decimal_places});
                    window.setTimeout(function(){
                        if ($element.autoNumeric('getSettings')!=undefined) {
                            $element.trigger('blur'); //FORCE REFRESH
                        };
                    }, 500);
                    // $element.tooltip({
                    //     placement: 'top',
                    //     title: 'Use DOT as decimal separator',
                    //     trigger: 'hover focus active'
                    // });
                    break;
                case /^INTEGER$/.test(uTypeField):
                    $element.attr('type', 'number');
                    break;
                case /^STRING$/.test(uTypeField):
                default:
                    $element.attr('type', 'text');
                    break;
            }
            if (parameters.debug == true) {
                console.log(field, uTypeField);
                $element.parent().append('<i class="type_field" style="font-size: 10px; color: #ccc;"><br>' + uTypeField + '</i>');
            }
            if (($element.hasClass('values') && !$element.hasClass('hide'))) {
                // build_select2_element($element, (!list_with_item && multiple == 'true'));
                build_select2_element($element);
            }
        });
    }; //END formata_type_values

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

    // NORMALIZED ON RAILS
    // var normalize_dictionary = function(dictionary) {
    //     $.each(dictionary, function(i, data) {
    //         if (is_blank(data.type)) {
    //             dictionary[i]['type'] = 'STRING';
    //         }
    //         if (is_blank(data.label)) {
    //             dictionary[i]['label'] = '';
    //         }
    //         if (is_blank(data.group)) {
    //             dictionary[i]['group'] = '';
    //         }
    //         if (is_blank(data.operators)) {
    //             dictionary[i]['operators'] = [{operator: '='}]
    //         }
    //     });
    //     return dictionary;
    // }; //EMD normalize_dictionary

    var is_blank = function (value) {
        return (value === undefined || value === null || value === [] || value === '')
    }; //END is_blank

    var flatten = function (arrays) {
        return [].concat.apply([], arrays);
    }; //END flatten

    var zeroFill = function (number, width) {
        width -= number.toString().length;
        if (width > 0) {
            return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
        }
        return number + "";
    };

    var order_by_group_and_label = function (a, b) {
        //removeDiacritics > diacritics.js
        var labelA = removeDiacritics(getLabel(a).toUpperCase());
        var labelB = removeDiacritics(getLabel(b).toUpperCase());
        var groupA = removeDiacritics(groupLabel(a).toUpperCase());
        var groupB = removeDiacritics(groupLabel(b).toUpperCase());
        if (groupA == groupB) {
            return (labelA < labelB) ? -1 : (labelA > labelB) ? 1 : 0;
        } else {
            return (groupA < groupB) ? -1 : 1;
        }
    }; //END ordear_por_label

    var getJson = function (url, force, cb) {
        if (force == undefined || force==null) {
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
                    if (cb!=undefined && typeof cb == 'function') {cb(dates)};
                }, errorr: function (errorr) {
                    alert("Could not load url " + url);
                }
            });
        }
        return jsonCache[url];
    }; //END getJson

    var build_select2_element = function (element, tags) {
        if (tags == undefined) tags = true;
        $element = $(element);
        var select2Config = parameters.select2Config;
        var ajax_url = $element.attr('data-ajax-values');
        if (ajax_url!=undefined) {
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

        if ($element.hasClass('fields')) {
            $.extend(select2Config, {placeholder: parameters.placeholder.fields});
        }
        if ($element.hasClass('operators')) {
            $.extend(select2Config, {placeholder: parameters.placeholder.operators});
        }
        if ($element.hasClass('values')) {
            $.extend(select2Config, {placeholder: parameters.placeholder.values});
        }

        if (tags == true) {
            $.extend(select2Config, {
                tags: true,
                tokenSeparators: [',',';',' ']
            });
        } else {
            if (parameters.allowBlank == true) {
                $.extend(select2Config, {allowClear: true});
                $element.find('option[value=""]:visible').hide();
            }
        }
        $.fn.select2.defaults.set("theme",(select2Config.theme || 'bootstrap'));
        $element.select2(select2Config);
    }

    //~~~ INIT
    $conditionBuilder.append('<div class="conditions"></div>');
    $conditionBuilder.on('change', '.conditions, .fields, .operators, .values, .fixed_value', event_build_expression);
    $conditionBuilder.on('change', '.conditions', event_validate_buttons);

    if (typeof parameters.dictionary == 'string') {
        parameters.dictionary = getJson(parameters.dictionary);
    }
    //parameters.dictionary = normalize_dictionary(parameters.dictionary);

    if (!is_blank(parameters.input)) {
        console.log('a');
        $conditionBuilder.load_values_from_input(parameters.input);
        $(document).on('change', parameters.input, function(ev){
            $conditionBuilder.load_values_from_input(parameters.input);
        });
    } else {
        $conditionBuilder.load_values(parameters.values);
    }
    return $conditionBuilder;
};