module VisualConditionBuilder
  module ApplicationHelper

    def build_conditions(dictionary, *args)
      dictionary_name = get_dictionary_name(dictionary)
      dictionary_klass = get_dictionary_klass(dictionary)
      container_name = "#{dictionary_name}_condition_container"

      hArgs = (args ||= []).reduce(Hash.new, :merge)
      hArgs = normalize_placeholder_label(hArgs)

      builder_options = {
          dictionary: dictionary_klass.dictionary(get_dictionary_context(dictionary), self.request)
      }.deep_merge(hArgs)

      capture do
        concat(content_tag(:div, nil, id: container_name))
        concat(javascript_tag(<<txtjs
            $(document).ready(function () {
              $('##{container_name}').conditionBuilder(#{builder_options.to_json});
            });
txtjs
        ))
      end
    end

    def conditions_fields(dictionary)
      dictionary_name = get_dictionary_name(dictionary)
      dictionary_klass = get_dictionary_klass(dictionary)
      @container_name = "##{dictionary_name}_condition_container"
      @fields = dictionary_klass.fields(get_dictionary_context(dictionary))
      render partial: 'visual_condition_builder/conditions_fields'
    end

    private
    def create_conditions_fields_item(fields)
      fields.each do |field, attrs|
        if field.is_a?(Hash) #GROUP
          group_label = field.values.first
          concat(content_tag(:li, group_label, class: 'dropdown-header'))
          create_conditions_fields_item(attrs)
        else
          concat(content_tag(:li, link_to(attrs[:label], '#', class: 'add-condition-field', data: {field: field})))
        end
      end
    end

    def get_dictionary_context(dictionary)
      dictionary.is_a?(Hash) ? dictionary.values.first : :default
    end
    def get_dictionary_name(dictionary)
      "#{dictionary.is_a?(Hash) ? dictionary.keys.first : dictionary}_#{get_dictionary_context(dictionary)}"
    end
    def get_dictionary_klass(dictionary)
      "#{dictionary.is_a?(Hash) ? dictionary.keys.first : dictionary}_dictionary".classify.constantize
    end

    def normalize_placeholder_label(args)
      args[:placeholder] ||= {}
      [:fields, :operators, :values].each do |attr|
        unless args[:placeholder][attr].present?
          label = I18n.t(attr, default: [''], scope: [:condition_builder, :placeholder])
          args[:placeholder][attr] = label if label.present?
        end
      end
      args
    end

  end
end
