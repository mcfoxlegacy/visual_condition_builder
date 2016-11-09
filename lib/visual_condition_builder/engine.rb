module VisualConditionBuilder
  class Engine < ::Rails::Engine
    # config.eager_load_paths << VisualConditionBuilder::Engine.root.join('app','widgets')
    config.autoload_paths << VisualConditionBuilder::Engine.root.join('app','widgets')
  end
end
