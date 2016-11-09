require 'rails/generators/base'

module VisualConditionBuilder
  class WidgetGenerator < Rails::Generators::NamedBase
    source_root File.expand_path("../../templates", __FILE__)

    def generate_widget
      @widget_name = file_name.classify
      view_dir = "app/views/widgets/#{widget_name_file}"

      template "generic_widget.erb", File.join('app/widgets', "#{widget_name_file}_widget.rb")

      if self.behavior == :revoke && Dir.exists?(view_dir)
        require 'fileutils'
        FileUtils.rm_rf(view_dir)
      elsif self.behavior == :invoke
        copy_file "generic_widget.html.erb", File.join(view_dir, 'exemplo.html.erb')
      end
    end

    def widget_name_file
      file_name.underscore
    end
  end
end