module VisualConditionBuilder
  module Helper

    define_method :to_condition_dictionary_values do
      records = self
      # klass = get_obj_class
      # klass.send(:to_condition_dictionary_values, self) if klass and klass.respond_to?(:to_condition_dictionary_values)
      raise records.inspect
    end

    private
    def get_obj_class
      (self.first.class rescue nil)
    end
  end

end

#INJETANDO METODO para_* em um conjunto de array
class Array
  include VisualConditionBuilder::Helper
end

#INJETANDO METODO para_* em um conjunto de registros ActiveRecord::Relation
module ActiveRecord
  class Relation
    include VisualConditionBuilder::Helper
  end
end