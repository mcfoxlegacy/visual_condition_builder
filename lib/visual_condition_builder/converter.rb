module VisualConditionBuilder
  class Converter
    def self.to_ransack(params)
      ransack_q = {}
      conditions = params.is_a?(Array) ? params : JSON.parse(params ||= '[]')
      conditions.map do |p|
        ransack_q["#{p[0]}_#{p[1]}"] = p[2]
      end
      ransack_q
    end
  end
end