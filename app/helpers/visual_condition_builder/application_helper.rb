module VisualConditionBuilder
  module ApplicationHelper

    def build_conditions(dictionary, *args)
      dictionary_name = get_dictionary_name(dictionary)

      base_name = "#{dictionary_name}_condition".camelize(:lower)
      object_name = "#{base_name}Builder"
      container_name = "#{dictionary_name}_condition_container"

      hArgs = (args ||= []).reduce(Hash.new, :merge)
      hArgs[:jsFnCallback] = "#{base_name}Callback" unless hArgs[:jsFnCallback].present?

      hArgs = normalize_placeholder_label(hArgs)

      builder_options = {
          dictionary: ObrigacaoDictionary.dictionary
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

    def conditions_fields(dictionary, *args)
      dictionary_name = get_dictionary_name(dictionary)
      container_name = "#{dictionary_name}_condition_container"
      capture do
        content_tag(:div, class: 'dropdown add-condition', data: {target: "##{container_name}"}) do
          concat(content_tag(:button, class: 'btn btn-default dropdown-toggle', data: {toggle: 'dropdown'}, type: 'button') do
            concat(I18n.t(:dropdown, default: ['Fields'], scope: [:condition_builder]))
            concat(content_tag(:span, nil, class:'caret'))
          end)
          concat(content_tag(:ul, class: 'dropdown-menu add-condition-menu') do
            ObrigacaoDictionary.fields(get_dictionary_context(dictionary)).each do |attrs|
              concat(content_tag(:li, link_to(attrs[:label], '#', class: 'add-condition-field', data: {field: attrs[:field]})))
            end
          end)
        end
      end
    end

    private
    def get_dictionary_context(dictionary)
      dictionary.is_a?(Hash) ? dictionary.values.first : :default
    end
    def get_dictionary_name(dictionary)
      "#{dictionary.is_a?(Hash) ? dictionary.keys.first : dictionary}_#{get_dictionary_context(dictionary)}"
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