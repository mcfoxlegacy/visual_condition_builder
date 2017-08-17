lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

require "visual_condition_builder/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = "visual_condition_builder"
  spec.version     = VisualConditionBuilder::VERSION
  spec.authors     = ["Bruno Porto"]
  spec.email       = ["brunotporto@gmail.com"]
  spec.homepage    = "https://github.com/brunoporto/visual_condition_builder"
  spec.summary     = "Visual Condition Builder to your rails project"
  spec.description = "A great and easy visual condition builder to your rails project"
  spec.license     = "MIT"

  # Prevent pushing this gem to RubyGems.org by setting 'allowed_push_host', or
  # delete this section to allow pushing this gem to any host.
  if spec.respond_to?(:metadata)
    spec.metadata['allowed_push_host'] = 'https://rubygems.org'
  else
    raise 'RubyGems 2.0 or newer is required to protect against public gem pushes.'
  end

  spec.license = 'MIT'
  spec.files = Dir["{app,config,lib}/**/*", "MIT-LICENSE", "README.md"]
  # spec.test_files = Dir["spec/**/*"]

  spec.add_dependency 'rails', ['>= 3', '< 6']
  # spec.add_runtime_dependency 'spreadsheet'
  # spec.add_runtime_dependency 'to_xls'

  # spec.add_development_dependency 'rspec'

end
