require 'rails/generators/base'

module VisualConditionBuilder
  class ViewGenerator < Rails::Generators::Base
    source_root File.expand_path("../../../../app/views/visual_condition_builder", __FILE__)

    def copy_views
      directory 'widgets', 'app/views/visual_condition_builder/widgets'
    end
  end
end