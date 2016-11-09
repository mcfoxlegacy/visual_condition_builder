class ApplicationWidget < ::ApplicationController
  include SingletonHelper

  attr_singleton :refresh_interval, 0

  def initialize(request)
    self.request = request
  end

  def render_template(view_file=nil, *args)
    args << {template: view_file}
    render_to_string *args
  end

  def view(view_file=nil, klass=nil)
    class_caller = klass || (caller[0].match(/(\b\w+)\.rb/)[1] rescue '')
    action_caller = view_file || (caller[0].match(/`(.*)'/)[1] rescue '')
    view_file = "widgets/#{class_caller.to_s.sub('_widget','')}/#{action_caller}" unless lookup_context.find_all(view_file).any?
    instance_variable_set(:@view_file, view_file)
  end

  def self.name?
    instance_variable_defined?(:@widget_name) ? instance_variable_get(:@widget_name) : ''
  end

  def self.name!(value)
    # define_singleton_method(:widget_name) {value}
    instance_variable_set(:@widget_name, value)
  end

  def self.description?(attr=nil)
    attr='widget' if attr.nil?
    instance_variable_defined?("@description_#{attr}") ? instance_variable_get("@description_#{attr}") : ''
  end

  def self.description!(*args)
    if args.size == 1
      instance_variable_set(:@description_widget, args[0])
    elsif args.size == 2
      instance_variable_set("@description_#{args[0]}", args[1])
    end
  end

  def self.widgets
    # ApplicationWidget.descendants.map do |klass| #Não estava carregando no primeiro load...
    Dir["#{Rails.root}/app/widgets/*.rb"].map do |file_path|
      file_name = File.basename(file_path, ".rb")
      klass = Object.const_get file_name.classify
      actions = klass.instance_methods(false).map do |action|
        {name: action, description: klass.description?(action)}
      end
      {code: klass.to_s.tableize.sub('_widgets',''), name: klass.name?, description: klass.description?, actions: actions}
    end
  end

end