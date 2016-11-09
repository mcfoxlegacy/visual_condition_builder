module VisualConditionBuilder
  class User < ActiveRecord::Base

    self.table_name = :visual_condition_builder_users

    belongs_to :user

    validates :widget, :action, presence: true
  end
end