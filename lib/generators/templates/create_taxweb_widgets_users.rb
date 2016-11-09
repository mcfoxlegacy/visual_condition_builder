class CreateVisualConditionBuilderUsers < ActiveRecord::Migration

  def up
    unless table_exists?(:visual_condition_builder_users)
      create_table :visual_condition_builder_users do |t|
        t.references :user, index: true, foreign_key: false
        t.string :widget
        t.string :action
        t.index [:widget, :action]
      end
    end
  end

  def down
    drop_table :visual_condition_builder_users if table_exists? :visual_condition_builder_users
  end

end
