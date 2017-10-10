# Visual Condition Builder 

A great and easy condition builder to your rails project

## How to install

Add it to your **Gemfile**: 
```ruby
gem 'visual_condition_builder'
```

Run the following command to install it:
```sh
$ bundle install
$ rails generate visual_condition_builder:install
```

Add it to your **app/assets/stylesheets/application.css**
```js
*= require visual_condition_builder
```

Add it to your **app/assets/javascripts/application.js**
```js
//= require visual_condition_builder
```

## Dependency

To work properly, the builder needs your project to have:

- jQuery

The builder already has some plugins that can conflict with your current plugins:

- [select2](https://github.com/select2/select2)
- [autoNumeric](https://github.com/BobKnothe/autoNumeric#default-settings--supported-options)
- [Sortable](https://github.com/RubaXa/Sortable)

### Select2 Languages

Select2 supports multiple languages by simply including the right language JS file (visual_condition_builder/select2_i18n/it, visual_condition_builder/select2_i18n/pt-BR, etc.) after visual_condition_builder in your **application.js**
```js
//= require visual_condition_builder/select2_i18n/en
//= require visual_condition_builder/select2_i18n/pt-BR
```

## Dictionaries

The condition builder information is based on a dictionary, so you need to create your dictionaries as needed.

To generate the dictionary structure run:
```sh
$ rails g visual_condition_builder:dictionary example
```
Will be created a file `app/condition_dictionaries/example_dictionary.rb`:

```ruby
class ExampleDictionary < VisualConditionBuilder::Dictionary

  dictionary do
    param :name
  end

end
```

You can create multiple contexts for a dictionary, so give it a name:
```ruby
  dictionary :simple do
    param :name
  end
  
  dictionary :complex do
    param :first_name
    param :last_name
  end
```

### Params

You have no restrictions on the use of parameters, they have no binding with models or any element of the application.
You can pass arguments to customize how the condition generator will be created:

```ruby
  dictionary do
    param :name, type: 'STRING', operators: [:eq]
    param :created_at, type: 'DATE', operators: [{operator: 'eq', label: 'Equal', multiple: true, no_value: false}]
    param :updated_at, type: 'DATE', operators: [{operator: 'between', label: 'Between ... and ...', multiple: 2, no_value: false}]
    param :today, type: 'DATE', operators: [{operator: 'eq', label: 'Equal', multiple: false, no_value: true}]
  end
```

See below all the arguments you can use:

Param | Description
--- | ----
label | Label of the field, if not informed, will search in the visual_condition_builder.*.yml. (default: param name) 
type | Type of the field. Responsible for defining how the values will be inserted (DatePicker, Numeric Mask, ...)
operators | Defines which operators you want to use, if not informed, the default operators will be used
values | Sets the default values for this field, restricting the user to those values.
group | Creates a separation in the field list by grouping the fields with this group

By default, the condition builder implements some operators and arguments, allowing you to enter only the operator name, like: `operators: [:eq, :between]` 

List of default operators:

Operator | Description | Default Arguments
--- | --- | ---
between | Between .. e .. | multiple: 2
today | Today(date) | no_value: true
yesterday | Yesterday(date) | no_value: true
tomorrow | Tomorrow(date) | no_value: true
this_week | First day of Current Week .. Last day of Current Week  | no_value: true
last_week | First day of Last Week .. Last day of Last Week | no_value: true
next_week | First day of Next Week .. Last day of Next Week | no_value: true
eq | Is exactly equal to a given value | multiple: false
not_eq | Opposite :eq | multiple: false
matches | Is like a given value | multiple: false
does_not_match |Opposite :matches | multiple: false
lt | is less than a given value | multiple: false
gt | is greater than a given value | multiple: false
lteq | is less than or equal to a given value | multiple: false
gteq | is greater than or equal to a given value | multiple: false
in | is within a specified list | multiple: true
not_in | Opposite :in | multiple: true
cont | contains a given value | multiple: false
not_cont | Opposite :not_cont  | multiple: false
cont_any | contains any of the given values | multiple: true
not_cont_any | Opposite :cont_any  | multiple: true
cont_all | contains all of the given values | multiple: true
not_cont_all | Opposite :cont_all  | multiple: true
start | begins with a given value | multiple: false
not_start | Opposite :start  | multiple: false
end | ends with a given value | multiple: false
not_end | Opposite :end  | multiple: false
true | where a field is true | no_value: true, multiple: false
not_true | Opposite :true  | no_value: true, multiple: false
false | where a field is false | no_value: true, multiple: false
not_false | Opposite :false  | no_value: true, multiple: false
present | where a field is present (not null and not a blank string) | no_value: true, multiple: false
blank | Opposite :present | no_value: true, multiple: false
null | where a field is null | no_value: true, multiple: false
not_null | Opposite :null  | no_value: true, multiple: false

if you dont fill the operators, the builder will use the operators by field type.
*If a type is not informed, it will be considered STRING*

Type | Default Operators
--- | ---
DATE, DATETIME | eq, between, today, yesterday, tomorrow, this_week, last_week, next_week, present, blank
TIME | eq, between, present, blank
DECIMAL, INTEGER | eq, between
STRING | cont, eq, start, end, present, blank
... | eq

The values parameter must be informed to the constructor so the user can make a selection between them.

```ruby
  dictionary do
    param :status, values: [{id: 1, label: 'Active', id: 2, label: 'Inactive'}]
    param :status_list, values: MyStatus.all.dictionary_values(:code, :title)
    param :status_proc, values: -> { current_user.get_status }
    param :status_ajax, values: -> { ajax_my_status_path }
  end
```

In all the above examples the result must always follow the structure:

```ruby
[
    {id: 1, label: 'Example'},
    {id: 2, label: 'Example 2'},
    {id: 'A', label: 'Example 3'},
    {id: 'Text', label: 'My Text'}
]
```

When using an AJAX call, the condition generator will make requests by passing two types of parameters: ** init ** or ** key **:
* init - is the parameter with the initial value of the list. When the plugin tries to load the list it should show an initial value before the search made by the user, so this initial value must be returned through the parameter init
* key - is the parameter with the value entered by the user to return the values from the list.

The return must follow the standard dictionary value structure and return in JSON format. Example of a controller that implements this function:
```ruby
class CitiesController < ApplicationController
  def ajax
    if params[:init]
      @cities = City.where(id: params[:init])
    else
      @cities = City.where('cities.name LIKE ?', "%#{params[:key]}%").order(:name).limit(100)
    end
    render json: @cities.select('cities.id, cities.name AS label').to_json
  end
end
```

### Methods

Dictionary Class have public methods to get informations about self:
* fields(dictionary_context_name)
* dictionary(dictionary_context_name)
* dictionary(dictionary_context_name, rails_request)
* dictionaries

```ruby
#example_dictionary.rb
class ExampleDictionary < VisualConditionBuilder::Dictionary

  dictionary do
    param :name
  end

  dictionary :complex do
    param :name
    param :age
  end
  
  dictionary :app_request do
    param :cities, values: -> { ajax_cities_path }
  end

end

#rails console
ExampleDictionary.fields
# =>  {:name=>{:label=>"Name", :type=>"STRING"}}

ExampleDictionary.fields(:complex)
# =>  {:name=>{:label=>"Name", :type=>"STRING"}, :age=>{:label=>"Age", :type=>"STRING"}}

ExampleDictionary.dictionary
# =>  [{:type=>"STRING", :operators=>[{:operator=>:cont, :multiple=>false, :no_value=>false, :label=>"Contém"}, {:operator=>:eq, :multiple=>false, :no_value=>false, :label=>"Igual"}, {:operator=>:start, :multiple=>false, :no_value=>false, :label=>"Começa com"}, {:operator=>:end, :multiple=>false, :no_value=>false, :label=>"Termina com"}, {:operator=>:present, :no_value=>true, :multiple=>false, :label=>"Presente"}, {:operator=>:blank, :no_value=>true, :multiple=>false, :label=>"Não Presente"}], :values=>[], :group=>"", :label=>"Name", :field=>:name}]

ExampleDictionary.dictionary(:complex)
# =>  [{:type=>"STRING", :operators=>[{:operator=>:cont, :multiple=>false, :no_value=>false, :label=>"Contém"}, {:operator=>:eq, :multiple=>false, :no_value=>false, :label=>"Igual"}, {:operator=>:start, :multiple=>false, :no_value=>false, :label=>"Começa com"}, {:operator=>:end, :multiple=>false, :no_value=>false, :label=>"Termina com"}, {:operator=>:present, :no_value=>true, :multiple=>false, :label=>"Presente"}, {:operator=>:blank, :no_value=>true, :multiple=>false, :label=>"Não Presente"}], :values=>[], :group=>"", :label=>"Name", :field=>:name}, {:type=>"STRING", :operators=>[{:operator=>:cont, :multiple=>false, :no_value=>false, :label=>"Contém"}, {:operator=>:eq, :multiple=>false, :no_value=>false, :label=>"Igual"}, {:operator=>:start, :multiple=>false, :no_value=>false, :label=>"Começa com"}, {:operator=>:end, :multiple=>false, :no_value=>false, :label=>"Termina com"}, {:operator=>:present, :no_value=>true, :multiple=>false, :label=>"Presente"}, {:operator=>:blank, :no_value=>true, :multiple=>false, :label=>"Não Presente"}], :values=>[], :group=>"", :label=>"Age", :field=>:age}] 

ExampleDictionary.dictionaries
# =>  {:default=>[{:type=>"STRING", :operators=>[{:operator=>:cont, :multiple=>false, :no_value=>false, :label=>"Contém"}, {:operator=>:eq, :multiple=>false, :no_value=>false, :label=>"Igual"}, {:operator=>:start, :multiple=>false, :no_value=>false, :label=>"Começa com"}, {:operator=>:end, :multiple=>false, :no_value=>false, :label=>"Termina com"}, {:operator=>:present, :no_value=>true, :multiple=>false, :label=>"Presente"}, {:operator=>:blank, :no_value=>true, :multiple=>false, :label=>"Não Presente"}], :values=>[], :group=>"", :label=>"Name", :field=>:name}], :padrao=>[{:type=>"STRING", :operators=>[{:operator=>:cont, :multiple=>false, :no_value=>false, :label=>"Contém"}, {:operator=>:eq, :multiple=>false, :no_value=>false, :label=>"Igual"}, {:operator=>:start, :multiple=>false, :no_value=>false, :label=>"Começa com"}, {:operator=>:end, :multiple=>false, :no_value=>false, :label=>"Termina com"}, {:operator=>:present, :no_value=>true, :multiple=>false, :label=>"Presente"}, {:operator=>:blank, :no_value=>true, :multiple=>false, :label=>"Não Presente"}], :values=>[], :group=>"", :label=>"Name", :field=>:name}, {:type=>"STRING", :operators=>[{:operator=>:cont, :multiple=>false, :no_value=>false, :label=>"Contém"}, {:operator=>:eq, :multiple=>false, :no_value=>false, :label=>"Igual"}, {:operator=>:start, :multiple=>false, :no_value=>false, :label=>"Começa com"}, {:operator=>:end, :multiple=>false, :no_value=>false, :label=>"Termina com"}, {:operator=>:present, :no_value=>true, :multiple=>false, :label=>"Presente"}, {:operator=>:blank, :no_value=>true, :multiple=>false, :label=>"Não Presente"}], :values=>[], :group=>"", :label=>"Age", :field=>:age}]}

ExampleDictionary.dictionary(:app_request)
# => [{:values=>#<Proc:0x00000008ddffb0@/path_to_project/app/condition_dictionaries/example_dictionary.rb:12 (lambda)>, :type=>"STRING", ...

ExampleDictionary.dictionary(:app_request, rails_app_request)
# =>  [{:values=>"/cities/ajax", :type=>"STRING", ...
```

## Helpers

#### (class) dictionary_values(param_id, param_label)
It should be used in objects of type: **Array** or **ActiveRecord::Relation**, the first parameter is **id** and the second is **label** for the dictionary

```ruby
dictionary do
  param :book_id, values: Book.all.dictionary_values(:code, :title)
  #MyService.myarray = [['Active','1'], ['Inactive','2'], ['Blocked','3']] 
  param :status, values: MyService.myarray.dictionary_values(1, 0)
end
```

#### (view) conditions_fields(name_of_dictionary)

Creates a field selector in a dropdown element (bootstrap).
```haml
= conditions_fields :example
-# with context:
= conditions_fields({:dictionary_name => :context_name})
```

You can create the list item manually `ExampleDictionary.fields (dictionary_name)` *(example_dictionary.rb)*, 
you must have 'clickable' elements with an `add-condition-field` class and `data-field: field_name` attribute
 ```haml
%a.add-condition-field{href: '#', data: {field: 'name'}} Name
%a.add-condition-field{href: '#', data: {field: 'age'}} Age
%a.add-condition-field{href: '#', data: {field: 'example'}} Example Field
 ```

#### (view) build_conditions(name_of_dictionary, *arguments)

How create condition builder in you view: 
```haml
= form_tag my_controller_path, method: :get do
    -# condition builder don't create input field with values, create it:
    = hidden_field_tag('my_conditions', @example_conditions.to_json)
    -# DropDown with fields
    = conditions_fields :example
    -# Conditions Element
    = build_conditions :example, input: '#my_conditions', select2Config: {allowClear: true}
```
Default element id: dictionary_name + context_name + condition_container: `example_default_condition_container`

To create based on a specific context dictionary use:
```haml
= build_conditions({:dictionary_name => :context_name}, input: '#my_conditions', select2Config: {allowClear: true})
```

Its possible change `conditions_fields` title:
```haml
= conditions_fields :example, title: 'Click here to select a field'
```


Possible arguments for build_conditions are:

Param | Description
--- | ---
placeholder | Placeholder for inputs {operators: 'Select a operator...', values: 'Enter a value...'}, 
values | initial values to fill conditions, format: [[field, operator, value], [field, operator, [value1, value2]]]
input  | to get initial values and save values on change from a html element, like: #my_input_element
debug | to see debugs flags. default: false
numericConfig | When the field is decimal type then the generator will create an input with numeric mask. Default {aSep: '', aDec: '.', aSign: ''}. See [Auto Numeric Plugin](https://github.com/BobKnothe/autoNumeric#default-settings--supported-options)
select2Config: | Select2 Configuration. Default {theme: "bootstrap", width: 'auto', placeholder: '', allowClear: false, dropdownAutoWidth: 'true', tags: false, language: "en"}, but some parameters can be overwritten by condition builder. See [Select2 Plugin](https://github.com/select2/select2)

You can also create the builder manually by calling the jquery plugin:
```javascript
//my_dictionary_json = ExampleDictionary.dictionary(:example).to_json
//my_initial_values = [['name','eq','My Name']]
var builder = $('#div-container').conditionBuilder({
    placeholder: {values: 'Select a Value'},
    dictionary: my_dictionary_json,
    values: my_initial_values,
    select2Config: {language: 'pt-BR'} //visual_condition_builder/select2_i18n/pt-BR
});
```

## Javascript Methods/Callback

The conditions builder plugin have two actions:
* **Clear** - clear the conditions rows
* **Result** - return the conditions values on change fields, operators or values.

Example:

```javascript
$(document).ready(function () {
    //get the builder instance
    var $conditionBuilder = $('#example_default_condition_container').data('conditionBuilder');

    //clear conditions rows
    $('#button_to_clear_list').on('click',function(e){
      e.preventDefault();
      $conditionBuilder.clear_rows();
    });
    
    //Callback on change conditions
    $conditionBuilder.result = function(data) {
        //result data object: [[field, operator, value], [field, operator, [value1, value2]]]
        console.log(data);
        //convert to STRING before send FORM
        var json_data = JSON.stringify(data);
    }
});
```

## Converters

Condition Builder have converters of values to use in controller:
* **Ransack** - Convert conditions values `['name', 'eq', 'My Name']` in `{:name_eq => "My Name"}`

```ruby
  @example_conditions = JSON.parse(params[:my_conditions] ||= '[]')
  ransack_params = VisualConditionBuilder::Converter.to_ransack(@example_conditions)
  @q = source.ransack(ransack_params)
  @records = @q.result.paginate(page: params[:page], per_page: 10)
```

## i18N

When you create the conditions with `build_conditions` and `conditions_fields` the builder automacaly translate attributes for you.
See locale file example `config/locales/visual_condition_builder.pt-BR.yml`:
Parameters with dots in the name are converted to underscores, example: "address.number" => "address_number" 

```yml
pt-BR:
  condition_builder:
    dropdown: 'Filtros'
    operators:
      between: 'Entre ... e ...'
      today: 'Hoje'
      yesterday: 'Ontem'
      tomorrow: 'Amanhã'
      this_week: 'Essa Semana'
      last_week: 'Semana Passada'
      next_week: 'Próxima Semana'
      eq: 'Igual'
      not_eq: 'Diferente'
      matches: 'Parecido'
      does_not_match: 'Não é Parecido'
      lt: 'Menor'
      gt: 'Maior'
      lteq: 'Menor ou Igual'
      gteq: 'Maior ou Igual'
      in: 'Possui todos'
      not_in: 'Não possui todos'
      cont: 'Contém'
      not_cont: 'Não Contém'
      cont_any: 'Contém algum'
      not_cont_any: 'Não Contém algum'
      cont_all: 'Contém todos'
      not_cont_all: 'Não contém todos'
      start: 'Começa com'
      not_start: 'Não começa com'
      end: 'Termina com'
      not_end: 'Não termina com'
      true: 'Verdadeiro'
      not_true: 'Não Verdadeiro'
      false: 'Falso'
      not_false: 'Não Falso'
      present: 'Presente'
      blank: 'Não Presente'
      null: 'Nulo'
      not_null: 'Não Nulo'
    placeholder:
      operators: 'Selecione um operador'
      values: 'Selecione um valor'
    dictionaries:
      exemplo: 'Meu Dicionário de Exemplo'
  condition_dictionaries:
    exemplo:
      name: 'Name'
      age: 'Age'
      address_number: "Adress Number"
```

## Bug reports

If you discover any bugs, feel free to create an issue on GitHub. Please add as much information as
possible to help us fixing the possible bug. We also encourage you to help even more by forking and
sending us a pull request.

https://github.com/brunoporto/visual_condition_builder/issues

## Maintainers

* Bruno Porto (https://github.com/brunoporto)

## License

The MIT License (MIT)
Copyright (c) 2016 Bruno Porto

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.