module SingletonHelper

  def self.included(base)
    base.extend ClassMethods
  end

  module ClassMethods
    def attr_singleton(attr, default=nil)
      define_singleton_method attr do |value=nil|
        if value.present?
          instance_variable_set("@#{attr}", value)
        else
          instance_variable_get("@#{attr}") || default
        end
      end
    end
  end

end