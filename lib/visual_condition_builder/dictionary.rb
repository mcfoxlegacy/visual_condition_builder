module VisualConditionBuilder
  class Dictionary
    class_attribute :dictionaries

    class << self
      def dictionary(name=:default, &block)
        (self.dictionaries ||= {})[name] ||= []
        @dictionary_name = name
        block.call if block_given?
        self.dictionaries[name]
      end

      def param(attr, *args)
        #DEFAULT VALUES
        args = array_hashes_to_hash(args)
        args[:field] ||= attr
        args[:type] ||= 'STRING'
        args[:operators] ||= operators_by_type(args[:type])
        args[:values] ||= []
        args[:label] ||= I18n.t(attr.to_sym, default: attr.to_s, scope: [:condition_dictionaries, dictionary_name])
        if args[:group].present? && args[:group].is_a?(Symbol)
          args[:group] = {args[:group] => I18n.t(args[:group], default: args[:group].to_s, scope: [:condition_dictionaries, dictionary_name, :groups])}
        end
        if args[:values].present? && args[:values].is_a?(Proc)
          args[:values] = args[:values].call
        end
        self.dictionaries[@dictionary_name] << args
      end

      def operators_by_type(type)
        type = type.present? ? type.to_s.downcase.to_sym : 'string'
        operators = case type
                      when :date
                        [:eq]
                      when :time
                        [:eq]
                      when :datetime
                        [:eq]
                      when :number
                        [:eq]
                      when :decimal
                        [:eq]
                      when :integer
                        [:eq]
                      when :string
                        [:eq, :not_eq]
                      else
                        []
                    end
        operators.map{|o| operators_list(o)}
      # rescue
      #   [{operator: '='}]
      end

      def operators_list(op=nil)
        operators = {
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
        operators.each do |op, attrs|
          attrs[:operator] = op.to_s
          attrs[:description] = operator_translate(op)
          operators[op] = attrs
        end
        (op.nil? ? operators : operators[op])
      end

      def operator_translate(op)
        I18n.t(op, default: op, scope: [:condition_builder, :operators])
      end

      def dictionary_name
        self.to_s.sub('Dictionary', '').underscore.to_sym
      end

      def array_hashes_to_hash(array=nil)
        array ||= []
        array.reduce Hash.new, :merge
      end
    end

  end
end