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
          when :not_null, :null, :blank, :true, :not_true, :false, :not_false, :present, :not_present
            #TODO: VALIDAR ESSES OPERADORES
            ransack_q["#{p[0]}_#{p[1]}"] = '1'
          else
            ransack_q["#{p[0]}_#{p[1]}"] = p[2]
        end
      end
      ransack_q
    end

    def self.to_mongo(params)
      query = []
      conditions = params.is_a?(Array) ? params : JSON.parse(params ||= '[]')
      conditions.map do |p|
        tmp = {}
        case p[1].to_s.downcase.to_sym
          when :eq
            tmp[p[0]] = p[2]
          when :not_eq
            tmp[p[0]] = Hash["$ne", p[2]]
          when :matches
            tmp[p[0]] = Hash["$regex",p[2]]
          when :does_not_match
            tmp[p[0]] = Hash["$regex","^((?!#{p[2]}).)*$"]
            tmp[p[0]]["$options"] = "s"
          when :lt
            tmp[p[0]] = Hash["$lt",  p[2]]
          when :gt
            tmp[p[0]] = Hash["$gt", p[2]]
          when :lteq
            tmp[p[0]] = Hash["$lte", p[2]]
          when :gteq
            tmp[p[0]] = Hash["$gte", p[2]]
          when :in
            tmp[p[0]] = Hash["$in", p[2]]
          when :not_in
            tmp[p[0]] = Hash["$nin", p[2]]
          when :cont
            tmp[p[0]] = Hash["$regex",p[2]]
          when :not_cont
            tmp[p[0]] = Hash["$regex","^((?!#{p[2]}).)*$"]
            tmp[p[0]]["$options"] = "s"
          when :cont_any
            if p[2].is_a?(Array)
              tmpAny = []
              p[2].each do |v|
                tmpAny << Hash[tmp[p[0]], Hash["$regex", v]]
              end
              tmp["$or"] = tmpAny
            end
          when :not_cont_any
            if p[2].is_a?(Array)
              tmpAny = []
              p[2].each do |v|
                tmpAny << Hash[tmp[p[0]], Hash["$regex", "^((?!#{v}).)*$", "$options" => "s"]]
              end
              tmp["$or"] = tmpAny
            end
          when :cont_all
            if p[2].is_a?(Array)
              tmpAny = []
              p[2].each do |v|
                tmpAny << Hash[tmp[p[0]], Hash["$regex", v]]
              end
              tmp["$and"] = tmpAny
            end
          when :not_cont_all
            if p[2].is_a?(Array)
              tmpAny = []
              p[2].each do |v|
                tmpAny << Hash[tmp[p[0]], Hash["$regex", "^((?!#{v}).)*$", "$options" => "s"]]
              end
              tmp["$and"] = tmpAny
            end
          when :start
            tmp[p[0]] = Hash["$regex", "^#{p[2]}"]
          when :not_start
            tmp[p[0]] = Hash["$regex", "^(?!#{p[2]})"]
          when :end
            tmp[p[0]] = Hash["$regex", "#{p[2]}$"]
          when :not_end
            tmp[p[0]] = Hash["$regex", "(?<!#{p[2]})$"]
          when :true
            tmp[p[0]] = 'true'
          when :not_true
            tmp[p[0]] = Hash["$ne", true]
          when :false
            tmp[p[0]] = 'false'
          when :not_false
            tmp[p[0]] = Hash["$ne", false]
          when :present
            tmp[p[0]] = Hash["$exists", true]
          when :not_present
            tmp[p[0]] = Hash["$exists", false]
          when :blank
            tmp[p[0]] = Hash["$in", ['null','']]
          when :null
            tmp[p[0]] = 'null'
          when :not_null
            tmp[p[0]] = Hash["$ne", 'null']
          when :between
            if p[2].is_a?(Array)
              tmp[p[0]]["$gte"] = p[2][0] if p[2][0]
              tmp[p[0]]["$lte"] = p[2][1] if p[2][1]
            end
          when :today
            tmp[p[0]] = Date.today
          when :yesterday
            tmp[p[0]] = Date.yesterday
          when :tomorrow
            tmp[p[0]] = Date.tomorrow
          when :this_week
            tmp[p[0]] = Hash["$gte", Date.today.beginning_of_week]
            tmp[p[0]]["$lte"] = Date.today.end_of_week
          when :last_week
            tmp[p[0]] = Hash["$gte", 1.week.ago.beginning_of_week]
            tmp[p[0]]["$lte"] = 1.week.ago.end_of_week
          when :next_week
            tmp[p[0]] = Hash["$gte", Date.today.next_week.beginning_of_week]
            tmp[p[0]]["$lte"] = Date.today.next_week.end_of_week
          else
            tmp[p[0]] = Hash[p[1],p[2]]
        end
        query << tmp if tmp.present?
      end
      query.present? ? Hash["$and", query] : {}
    end
  end
end