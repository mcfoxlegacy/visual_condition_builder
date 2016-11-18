require 'rails/generators/base'

module VisualConditionBuilder
  class DictionaryGenerator < Rails::Generators::NamedBase
    source_root File.expand_path("../../templates", __FILE__)

    def generate_dictionary
      @dictionary_name = file_name.classify
      template "generic_dictionary.erb", File.join('app/condition_dictionaries', "#{file_name.underscore}_dictionary.rb")
    end
  end
end