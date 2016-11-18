module VisualConditionBuilder
  class Converter
    def self.to_ransack(params)
      ransack_q = {}
      conditions = params.is_a?(Array) ? params : JSON.parse(params ||= '[]')
      conditions.map do |p|
        case p[1].to_s.downcase.to_sym
          when :between
            if p[2].is_a?(Array)
              ransack_q["#{p[0]}_gteq"] = p[2][0] if p[2][0]
              ransack_q["#{p[0]}_lteq"] = p[2][1] if p[2][1]
            end
          when :today
            ransack_q["#{p[0]}_eq"] = Date.today
          when :yesterday
            ransack_q["#{p[0]}_eq"] = Date.yesterday
          when :tomorrow
            ransack_q["#{p[0]}_eq"] = Date.tomorrow
          when :this_week
            ransack_q["#{p[0]}_gteq"] = Date.today.beginning_of_week
            ransack_q["#{p[0]}_lteq"] = Date.today.end_of_week
          when :last_week
            ransack_q["#{p[0]}_gteq"] = 1.week.ago.beginning_of_week
            ransack_q["#{p[0]}_lteq"] = 1.week.ago.end_of_week
          when :next_week
            ransack_q["#{p[0]}_gteq"] = Date.today.next_week.beginning_of_week
            ransack_q["#{p[0]}_lteq"] = Date.today.next_week.end_of_week
          when :not_null, :null, :blank, :true, :not_true, :false, :not_false, :present
            ransack_q["#{p[0]}_#{p[1]}"] = '1'
          else
            ransack_q["#{p[0]}_#{p[1]}"] = p[2]
        end
      end
      ransack_q
    end
  end
end