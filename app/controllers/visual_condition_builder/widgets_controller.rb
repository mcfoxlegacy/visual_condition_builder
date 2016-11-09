require_dependency "visual_condition_builder/application_controller"

module VisualConditionBuilder
  class WidgetsController < ApplicationController

    def load
      widget = VisualConditionBuilder::Widget.new(params[:widget_name], self.request)
      content = widget.html(params[:widget_action])
    rescue Exception => e
      content = e.message
    ensure
      render html: content, layout: false
    end

    def user
      user_id = params[:id] || current_user.id
      @widgets_code = VisualConditionBuilder::User.where(user_id: user_id).pluck(:widget, :action).map{|r| "#{r[0]}_#{r[1]}"}
      render partial: 'widgets_list'
    end

    def index
    end

    def save
      user_id = params[:user_id] || current_user.id
      widgets = params[:widgets]
      widget_name_user = []
      action_user = []
      if widgets.present?
        widgets.each do |widget|
          widget_name, action = widget.split('|')
          if widget_name && action
            widget_name_user << widget_name
            action_user << action
            VisualConditionBuilder::User.find_or_create_by(widget: widget_name, action: action, user_id: user_id)
          end
        end
      end
      VisualConditionBuilder::User.where(user_id: user_id).where.not(widget: widget_name_user, action: action_user).destroy_all
      flash[:success] = 'Alterações foram salvas com sucesso!'
      redirect_to visual_condition_builder_path
    end

  end
end