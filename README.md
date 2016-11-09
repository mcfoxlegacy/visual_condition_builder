# Search Builder

A great and easy search builder to your rails project

### Instalação

Add it to your **Gemfile**: 
```ruby
gem 'visual_condition_builder'
```

Rubn the following command to install it:
```sh
$ bundle install
```

Add it to your **app/assets/stylesheets/application.css**
```js
    *= require visual_condition_builder
```

Add it to your **app/assets/javascripts/application.js**
```js
    //= require visual_condition_builder
```
### Dependencies

Antes de iniciar o plugin você precisa ter o jQuery adicionado no seu application.js

Caso você tenha os seguintes plugins jQuery indicados no seu application.js, você deve remover:

- select2
- autoNumeric


### Select2 Languages

Select2 supports multiple languages by simply including the right language JS file (visual_condition_builder/select2_i18n/it, visual_condition_builder/select2_i18n/pt-BR, etc.) after visual_condition_builder in your **application.js**
```js
//= require visual_condition_builder
//= require visual_condition_builder/select2_i18n/pt-BR
```

## Como usar

Instancie em um elemento jQuery passando os parametros necessários:

```javascript
var builder = $('#div-exemplo-regras').ruleBuilder({
    dicionario: [],
    regras: [],
    texto_instrucao: {
        campos: 'Selecione um campo',
        operadores: 'Selecione um operador',
        valores: 'Informe um valor'
    },    
    permite_brancos: true,
    resultado: function(dados) {
      //RETORNO DO RESULTADO EM JSON
    }
});
```

Nos parâmetros dicionário e regras você pode informar diretamente um objeto com os dados ou informar uma url para carregar os dados. Atualmente o carregamento dessa fonte de dados é feita de forma síncrona);
```javascript
var dicionario = [{
    "variavel": "nome_do_campo", //
    "tipo": "STRING", //
    "descricao": "descricao_do_campo", //
    "operadores": [
      {"operador": "simbolo_do_operador", "descricao": "texto_do_operador"},
      {"operador": "=", "descricao": "Igual"},
      {"operador": "EMPTY", "descricao": "Vazio", "sem_valor": "true"},
      {"operador": "IN", "descricao": "Presente em", "multiplo": "true"},
      {"operador": "BETWEEN", "descricao": "Entre", "multiplo": "2" }
    ],
    "valores": [
      {"id": "1", "label": "Um"},
      {"id": "65465", "label": "José da Silva"},
      {"id": "2016-06-15", "label": "Data de Hoje"},
      {"id": "50.8", "label": "Valor Total"}
    ]
}];
```
### Parâmetros

#### **dicionario**

> Array de Hash: `[{},{},{}, ...]`

- *variavel*: Indica qual será o VALUE utilizado no `<option>` do `<select>` na coluna CAMPO
- *tipo*: Qual o tipo do valor do campo, esse tipo influência nos valores. Ex: Date mostra um datepicker no `<input>` do valor.
	- STRING, DECIMAL(n), INTEGER, DATE, TIME
- *descricao*: Indica qual será o TEXT utilizado no `<option>` do `<select>` na coluna CAMPO
- *operadores*: Array de Hash com os operadores que esse campo possibilita selecionar.
	- *operador*: Indica qual será o VALUE utilizado no `<option>` do `<select>` na coluna OPERADOR
	- *descricao*: Indica qual será o TEXT utilizado no `<option>` do `<select>` na coluna OPERADOR
	- *sem_valor*: Indica que esse operador não requer um valor, logo ele não será exibido.
	- *multiplo*: Indica que o campo possibilita informar multiplos valores. Caso você passe um número para esse campo, esse número indicará quantas caixas de valores serão exibidas para esse campo.
- *valores*: É o Array dos valores que será exibidos para o usuário durante a seleção desse campo. Caso você não informe valores, será exibido um campo em aberto de acordo com o tipo selecionado. Também pode ser informado uma URL para carregar os dados diretamente dessa fonte.
	- *id*: Indica qual será o VALUE utilizado no `<option>` do `<select>` na coluna VALOR
	- *label*: Indica qual será o TEXT utilizado no `<option>` do `<select>` na coluna VALOR
	- *Exemplo*: `"valores": [{"id": "S", "label": "Sim" }, {"id": "N", "label": "Não" }]`

#### **regras**

> Array de Array:  `[[],[], ...]`

Esse parâmetro permite informar os dados que serão pré-selecionados ao carregar o plugin, é o estado inicial do plugin.
O array interno das regras sempre deverá ser informado com 3 elementos: `["CAMPO], "OPERADOR", "VALOR"]`, onde o valor poderá ser uma outra array caso esse campo permita seleção de múltiplos valores.

Exemplo:

```javascript
var regras = [
  ["nome_do_campo", "simbolo_do_operador", "id_do_valor"],
  ["campo_sim_ou_nao", "=", "S"],
  ["campo_decimal", "=", "88884.55"],
  ["campo_multiplo_2", "BETWEEN", ["2015-07-21","2015-07-30"]],
  ["campo_multiplo_true", "IN", ["A","B","C","D"]]
];
```

#### **permite_brancos**

> Boleano: true/false

Esse campo permite informar se as caixas de seleção irão ou não iniciar com valor "vazio" para que o usuário possa selecionar. Caso *false* seja informado o primeiro valor de cada coluna será pré-selecionado.

#### **resultado**

> Função: `function(dados){}`

Callback de retorno dos dados em JSON (type object), o retorno segue o mesmo padrão do parâmetro regra, logo o mesmo formato que você informa para pré-popular o plugin será o formato que o plugin retornará apóas as modificações do usuário.

Exemplo:
```javascript
  var resultado = function(objJSON) {
    //CONVERTO JSON EM STRING COMO EXEMPLO...
    var stringJSON = JSON.stringify(objJSON);
  }
```

Esse callback é chamado toda vez que o usuário faz uma modificação no plugin. Caso você queira forçar a recuperação desses dados através de um botão, você pode fazer:
```javascript
  var builder = $('#div-exemplo-regras').ruleBuilder({
    //...
  });

  $('#meu-botao').click(function(){
    var objJSON = builder.getResultado();
    //CONVERTO JSON EM STRING COMO EXEMPLO...
    var stringJSON = JSON.stringify(objJSON);
  });
```