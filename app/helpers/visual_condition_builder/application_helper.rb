module VisualConditionBuilder
  module ApplicationHelper

    def visual_conditions(dictionary, *args)
      if dictionary.is_a?(Hash)
        dictionary_name = "#{dictionary.keys.first}_#{dictionary.values.first}"
      else
        dictionary_name = "#{dictionary}_default"
      end

      base_name = "#{dictionary_name}_condition".camelize(:lower)
      object_name = "#{base_name}Builder"
      container_name = "#{dictionary_name}_condition_container"

      hArgs = (args ||= []).reduce(Hash.new, :merge)
      hArgs[:jsFnCallback] = "#{base_name}Callback" unless hArgs[:jsFnCallback].present?

      builder_options = {
          dictionary: ObrigacaoDictionary.dictionary
      }.deep_merge(hArgs)

      capture do
        concat(content_tag(:div, nil, id: container_name))
        concat(javascript_tag(<<txtjs
            $(document).ready(function () {
              window['#{object_name}'] = $('##{container_name}').conditionBuilder(#{builder_options.to_json});
            });
txtjs
        ))
      end
    end

  end
end