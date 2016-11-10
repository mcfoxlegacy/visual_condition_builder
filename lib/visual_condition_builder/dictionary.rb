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
        args[:operators] ||= [{operator: '='}]
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