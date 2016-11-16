module VisualConditionBuilder
  class Converter
    def self.to_ransack(params)
      ransack_q = {}
      conditions = params.is_a?(Array) ? params : JSON.parse(params ||= '[]')
      conditions.map do |p|
        #TODO: Verificar se o código deve ser inserido com inteligência para juntar os campos de mesmo operador
        # if ransack_q["#{p[0]}_#{p[1]}"].present?
        #     old_value = ransack_q["#{p[0]}_#{p[1]}"]
        #     ransack_q.delete("#{p[0]}_#{p[1]}")
        #     ransack_q["#{p[0]}_in"] = []
        #     ransack_q["#{p[0]}_in"] << old_value
        #     ransack_q["#{p[0]}_in"] << p[2]
        # else
        #   ransack_q["#{p[0]}_#{p[1]}"] = p[2]
        # end
        ransack_q["#{p[0]}_#{p[1]}"] = p[2]
      end
      ransack_q
    end
  end
end