class ApplicationDictionary < ::ApplicationController
  include VisualConditionBuilder::ApplicationHelper

  def initialize(request)
    self.request = request
  end

  def dictionary(dictionar_klass_name, context)
    @klass = Object.const_get "#{dictionar_klass_name}".classify
    dictionary = @klass.dictionary(context)
    dictionary.each do |field|
      if field[:values].present? && field[:values].is_a?(Proc)
        field[:values] = self.instance_exec(&field[:values])
      end
      if field[:operators].present? && field[:operators].is_a?(Proc)
        field[:operators] = self.instance_exec(&field[:operators])
      end
    end
    dictionary
  end

end