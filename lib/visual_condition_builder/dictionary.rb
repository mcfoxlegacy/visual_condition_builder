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
        operators.map{|o| operators_list[o]}.deep_merge
      rescue
        [{operator: '='}]
      end

      def operators_list
        {
            eq: {operator: 'eq', multiple: false},
            not_eq: {operator: 'eq', multiple: false},

            matches: {operator: 'matches', multiple: false},
            does_not_match: {operator: 'matches', multiple: false},

            lt: {operator: 'lt', multiple: false},
            gt: {operator: 'gt', multiple: false},

            lteq: {operator: 'lteq', multiple: false},
            gteq: {operator: 'gteq', multiple: false},

            in: {operator: 'in', multiple: true},
            not_in: {operator: 'not_in', multiple: true},

            cont: {operator: 'cont', multiple: false},
            not_cont: {operator: 'not_cont', multiple: false},

            cont_any: {operator: 'cont_any', multiple: true},
            not_cont_any: {operator: 'not_cont_any', multiple: true},

            cont_all: {operator: 'cont_all', multiple: true},
            not_cont_all: {operator: 'not_cont_all', multiple: true},

            start: {operator: 'start', multiple: false},
            not_start: {operator: 'not_start', multiple: false},

            end: {operator: 'end', multiple: false},
            not_end: {operator: 'not_end', multiple: false},

            true: {operator: 'true', no_value: true, multiple: false},
            not_true: {operator: 'not_true', no_value: true, multiple: false},

            false: {operator: 'false', no_value: true, multiple: false},
            not_false: {operator: 'not_false', no_value: true, multiple: false},

            present: {operator: 'present', no_value: true, multiple: false},
            blank: {operator: 'blank', no_value: true, multiple: false},

            null: {operator: 'null', no_value: true, multiple: false},
            not_null: {operator: 'not_null', no_value: true, multiple: false},
        }
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