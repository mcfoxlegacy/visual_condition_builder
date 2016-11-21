module VisualConditionBuilder
  class Dictionary
    class_attribute :dictionaries

    class << self
      def method_missing(m, *args, &block)
        if m =~ /_url|_path/
          Rails.application.routes.url_helpers.send(m, args)
        end
      end

      def dictionary(name=:default, request=nil, &block)
        (self.dictionaries ||= {})[name] ||= []
        @dictionary_name = name
        block.call if block_given?
        if request.present?
          ApplicationDictionary.new(request).send(:dictionary, self.name, name)
        else
          self.dictionaries[name]
        end
      end

      def fields(dictionary_name=:default)
        dictionary ||= {}
        self.dictionaries[dictionary_name].group_by{|h| h[:group]}.each do |group, attrs|
          dictionary[group] ||= {} if group.present?
          attrs.each do |attr|
            if group.present?
              dictionary[group][attr[:field]] = attr.slice(:label, :type)
            else
              dictionary[attr[:field]] = attr.slice(:label, :type)
            end
          end
        end
        dictionary
      end

      def param(attr, *args)
        #DEFAULT VALUES
        args = array_hashes_to_hash(args)
        args[:type] ||= 'STRING'
        args[:operators] = operators_by_type(args[:type]) unless args[:operators].present?
        args[:operators] = normalize_operators(args[:operators])
        args[:values] ||= []
        args[:group] ||= ''
        if args[:group].present? && args[:group].is_a?(Symbol)
          args[:label] ||= I18n.t(attr.to_sym, default: attr.to_s.humanize, scope: [:condition_dictionaries, args[:group]])
          args[:field] ||= "#{args[:group]}_#{attr}"
          args[:group] = {args[:group] => I18n.t(args[:group], default: args[:group].to_s, scope: [:condition_builder, :dictionaries])}
        else
          args[:label] ||= I18n.t(attr.to_sym, default: attr.to_s.humanize, scope: [:condition_dictionaries, dictionary_name])
          args[:field] ||= attr
        end
        if normalized_name(args[:type])==:boolean && args[:label] !~ /\?$/
          args[:label]+='?'
        end

        self.dictionaries[@dictionary_name] << args
      end

      def operators_by_type(type)
        type = type.present? ? normalized_name(type) : 'string'
        operators = case type
                      when :date, :datetime
                        [:eq, :between, :today, :yesterday, :tomorrow, :this_week, :last_week, :next_week, :present, :blank]
                      when :time
                        [:eq, :between, :present, :blank]
                      when :decimal, :integer
                        [:eq, :between]
                      when :boolean
                        [:true, :false, :present, :blank]
                      when :string
                        [:cont, :eq, :start, :end, :present, :blank]
                      else
                        [:eq]
                    end
        operators.map{|op| operator_default(op) }
      end

      def normalize_operators(operators)
        operators.map do |operator|
          operator = operator_default(operator) unless operator.is_a?(Hash)
          operator[:no_value] ||= false
          operator[:multiple] ||= false
          operator[:label] ||= operator_translate(operator[:operator])
          operator
        end
      end

      def operators_list(op=nil)
        operators = {
            between: {multiple: 2},
            today: {no_value: true},
            yesterday: {no_value: true},
            tomorrow: {no_value: true},
            this_week: {no_value: true},
            last_week: {no_value: true},
            next_week: {no_value: true},

            eq: {multiple: false},
            not_eq: {multiple: false},

            matches: {multiple: false},
            does_not_match: {multiple: false},

            lt: {multiple: false},
            gt: {multiple: false},

            lteq: {multiple: false},
            gteq: {multiple: false},

            in: {multiple: true},
            not_in: {multiple: true},

            cont: {multiple: false},
            not_cont: {multiple: false},

            cont_any: {multiple: true},
            not_cont_any: {multiple: true},

            cont_all: {multiple: true},
            not_cont_all: {multiple: true},

            start: {multiple: false},
            not_start: {multiple: false},

            end: {multiple: false},
            not_end: {multiple: false},

            true: {no_value: true, multiple: false},
            not_true: {no_value: true, multiple: false},

            false: {no_value: true, multiple: false},
            not_false: {no_value: true, multiple: false},

            present: {no_value: true, multiple: false},
            blank: {no_value: true, multiple: false},

            null: {no_value: true, multiple: false},
            not_null: {no_value: true, multiple: false},
        }
        if op.present?
          (operators[normalized_name(op)] || {})
        else
          operators
        end
      end

      def operator_default(op)
        op_default = operators_list(op)
        operator = {operator: normalized_name(op)}
        operator.deep_merge!(op_default) if op_default.present?
        operator
      end

      def operator_translate(op)
        I18n.t(op, default: op.to_s.humanize, scope: [:condition_builder, :operators])
      end

      def dictionary_name
        self.to_s.sub('Dictionary', '').underscore.to_sym
      end

      def array_hashes_to_hash(array=nil)
        array ||= []
        array.reduce Hash.new, :merge
      end

      def normalized_name(op)
        op.to_s.downcase.to_sym
      end
    end

  end
end