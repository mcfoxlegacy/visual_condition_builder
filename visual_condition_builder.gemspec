$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "visual_condition_builder/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = "visual_condition_builder"
  spec.version     = VisualConditionBuilder::VERSION
  spec.authors     = ["Bruno Porto"]
  spec.email       = ["brunotporto@gmail.com"]
  spec.homepage    = "https://github.com/brunoporto/visual_condition_builder"
  spec.summary     = "A great and easy visual condition builder to your rails project"
  spec.description = "A great and easy visual condition builder to your rails project"
  spec.license     = "MIT"

  spec.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]
  # spec.test_files = Dir["spec/**/*"]

  # spec.add_dependency 'rails', ['>= 3', '< 5']
  # spec.add_runtime_dependency 'spreadsheet'
  # spec.add_runtime_dependency 'to_xls'

  # spec.add_development_dependency 'rspec'

end
