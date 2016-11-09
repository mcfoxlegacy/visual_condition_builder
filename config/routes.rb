Rails.application.routes.draw do


  namespace :visual_condition_builder do

    get 'widgets/load/:widget_name/:widget_action', to: 'widgets#load', as: 'load'
    get 'widgets/user(/:id)', to: 'widgets#user', as: 'user'
    get 'widgets', to: 'widgets#index', as: ''
    put 'widgets/save', to: 'widgets#save', as: 'save'


  end






end
