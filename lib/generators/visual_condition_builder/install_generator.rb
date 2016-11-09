require 'rails/generators/base'
require 'rails/generators/migration'

module VisualConditionBuilder
  class InstallGenerator < Rails::Generators::Base
    source_root File.expand_path("../../templates", __FILE__)
    include Rails::Generators::Migration

    class_option :orm
    desc 'Instalando Taxweb Widgets'

    desc 'Criando Migrations'
    def self.next_migration_number(path)
      unless @prev_migration_nr
        @prev_migration_nr = Time.now.utc.strftime("%Y%m%d%H%M%S").to_i
      else
        @prev_migration_nr += 1
      end
      @prev_migration_nr.to_s
    end

    def create_migration_file
      migration_template 'create_visual_condition_builder_users.rb', 'db/migrate/create_visual_condition_builder_users.rb'
    end
  end
end