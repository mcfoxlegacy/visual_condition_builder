module VisualConditionBuilder
  class Dictionary
    #
    # attr_accessor :widget, :klass
    #
    # def initialize(widget_name, request)
    #   @klass_name = widget_name
    #   @klass = Object.const_get "#{@klass_name}_widget".classify
    #   @widget = @klass.new(request)
    # end
    #
    # def param(param)
    #   @klass.send(param)
    # end
    #
    # def html(action)
    #   content = @widget.send(action)
    #   view_file = (@widget.instance_variables.include?(:@view_file) ? @widget.instance_variable_get(:@view_file) : @widget.view(action, @klass_name))
    #   @widget.render_template(view_file) # rescue content
    # end

  end
end